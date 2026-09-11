(function(root){
  "use strict";
  let sharedAccess=null;
  // Live input owns its voices, so playing a chord never cancels the backing track.
  function create({canPlay,onNotes=()=>{},onStatus=()=>{},onError=()=>{}}){
    const voices=new Map(),pedals=new Set(),ports=new Map(),timers=new Set();
    let access=sharedAccess,disposed=false,connecting=false,sequence=0;
    const notify=()=>onNotes([...voices.values()].filter(v=>v.sounding).map(v=>v.note));
    async function prepare(){
      if(location.protocol==="file:")return;
      const ctx=context();
      if(ctx.state==="suspended")await ctx.resume();
      await loadPianoSamples();
      if(ctx.state!=="running"||!pianoSamples.size)throw Error("钢琴音色未准备好，请再试一次。");
    }
    function sound(note,velocity){
      const sample=nearestPianoSample(note),volume=.035+.085*velocity/127;
      if(location.protocol==="file:"){
        const audio=new Audio(`assets/piano/${sample.file}`);
        audio.playbackRate=2**((note-sample.midi)/12);audio.preservesPitch=false;audio.volume=volume*3;
        audio.play().catch(()=>{if(!disposed)onError("声音未能播放，请再点一次演奏按钮。");});
        return ()=>audio.pause();
      }
      const ctx=context(),source=ctx.createBufferSource(),gain=ctx.createGain(),at=ctx.currentTime;
      source.buffer=pianoSamples.get(sample.midi);source.playbackRate.value=2**((note-sample.midi)/12);
      gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.008);
      source.connect(gain);gain.connect(pianoOutput);
      source.onended=()=>{source.disconnect();gain.disconnect();};source.start(at);
      return immediate=>{
        const end=ctx.currentTime;
        gain.gain.cancelScheduledValues(end);gain.gain.setTargetAtTime(.0001,end,immediate ? .005 : .04);
        try{source.stop(end+(immediate ? .03 : .18));}catch{}
      };
    }
    function release(key,immediate=false){
      const voice=voices.get(key);if(!voice)return;
      voice.stop?.(immediate);voices.delete(key);
    }
    async function noteOn(note,velocity,key,group){
      if(disposed||!canPlay()||!Number.isInteger(note)||note<0||note>127)return;
      release(key,true);
      const voice={note,group,held:true,sounding:false};voices.set(key,voice);
      try{
        await prepare();
        if(disposed||voices.get(key)!==voice||!canPlay()){if(voices.get(key)===voice)voices.delete(key);return;}
        voice.stop=sound(note,velocity);voice.sounding=true;notify();
      }catch(error){
        if(voices.get(key)!==voice)return;
        voices.delete(key);notify();if(!disposed)onError(error.message);
      }
    }
    function noteOff(key){
      const voice=voices.get(key);if(!voice)return;
      voice.held=false;
      if(!pedals.has(voice.group))release(key);
      notify();
    }
    function stop(){
      timers.forEach(clearTimeout);timers.clear();
      [...voices.keys()].forEach(key=>release(key,true));pedals.clear();notify();
    }
    function playChord(notes,duration){
      if(disposed||!canPlay())return;
      const group=`button-${++sequence}`;
      notes.forEach(note=>{
        const key=`${group}:${note}`;
        noteOn(note,96,key,group).then(()=>{
          if(!voices.has(key))return;
          const timer=setTimeout(()=>{timers.delete(timer);noteOff(key);},duration*1000);timers.add(timer);
        });
      });
    }
    function receive(port,event){
      if(disposed||!canPlay())return;
      const [status,note,value]=event.data;
      if(event.data.length!==3)return;
      const kind=status&0xf0,group=`midi:${port.id}:${status&0x0f}`,key=`${group}:${note}`;
      if(kind===0x90&&value>0)noteOn(note,value,key,group);
      else if(kind===0x80||kind===0x90)noteOff(key);
      else if(kind===0xb0){
        if(note===64){
          if(value>=64)pedals.add(group);
          else {pedals.delete(group);for(const [id,v] of voices)if(v.group===group&&!v.held)release(id);notify();}
        }else if(note===120||note===123){
          for(const [id,v] of voices)if(v.group===group)release(id,true);
          pedals.delete(group);notify();
        }
      }
    }
    function syncPorts(){
      if(disposed||!access)return;
      const connected=[...access.inputs.values()].filter(port=>port.state==="connected");
      for(const [id,{port,handler}] of ports){
        if(connected.includes(port))continue;
        port.removeEventListener("midimessage",handler);ports.delete(id);
        for(const [key,v] of voices)if(v.group.startsWith(`midi:${id}:`))release(key,true);
        for(const group of pedals)if(group.startsWith(`midi:${id}:`))pedals.delete(group);
      }
      for(const port of connected){
        if(ports.has(port.id))continue;
        const handler=event=>receive(port,event);ports.set(port.id,{port,handler});
        port.addEventListener("midimessage",handler);
      }
      notify();onStatus(connected.length?`已连接：${connected.map(p=>p.name||"MIDI 键盘").join("、")}`:"未发现 MIDI 键盘；插入设备后会自动连接，也可以用演奏按钮。");
    }
    async function connect(){
      if(disposed||connecting)return;
      if(!root.navigator?.requestMIDIAccess){onStatus("此浏览器不支持 MIDI 输入；可用演奏按钮，或换支持 Web MIDI 的浏览器打开本机地址。");return;}
      if(root.isSecureContext===false){onStatus("MIDI 需要在本机 localhost / 127.0.0.1 或 HTTPS 页面连接。");return;}
      connecting=true;onStatus("正在连接 MIDI 键盘…");
      prepare().catch(error=>{if(!disposed)onError(error.message);});
      try{
        if(!access){
          const result=await root.navigator.requestMIDIAccess({sysex:false});
          if(disposed)return;
          sharedAccess=access=result;access.addEventListener("statechange",syncPorts);
        }
        syncPorts();
      }catch(error){
        if(!disposed)onStatus(error.name==="NotAllowedError"||error.name==="SecurityError"?"未获准使用 MIDI。可在浏览器中允许后重试，或使用演奏按钮。":"MIDI 连接未成功，请检查设备后重试。");
      }finally{connecting=false;}
    }
    function dispose(){
      disposed=true;stop();access?.removeEventListener("statechange",syncPorts);
      ports.forEach(({port,handler})=>port.removeEventListener("midimessage",handler));ports.clear();
    }
    if(access){access.addEventListener("statechange",syncPorts);syncPorts();}
    return {playChord,connect,stop,dispose};
  }
  root.ChordInstrument={create};
})(typeof globalThis!=="undefined"?globalThis:this);
