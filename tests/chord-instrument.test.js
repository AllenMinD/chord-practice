const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const code=fs.readFileSync(require.resolve("../chord-instrument.js"),"utf8");
const flush=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};
function port(id="keyboard"){
  return Object.assign(new EventTarget(),{id,name:"Test Keyboard",state:"connected"});
}
function send(input,...data){
  const event=new Event("midimessage");event.data=new Uint8Array(data);input.dispatchEvent(event);
}
function setup(options={}){
  const input=port(),access=Object.assign(new EventTarget(),{inputs:new Map([[input.id,input]])});
  const sources=[],timers=new Map(),statuses=[],errors=[],notes=[];
  let enabled=true,requests=0,sequence=0;
  const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
  const ctx={currentTime:0,state:"running",createGain:()=>({gain:param(),connect(){},disconnect(){}}),createBufferSource(){
    const source={playbackRate:param(),starts:0,stops:0,connect(){},disconnect(){},start(){this.starts++;},stop(){this.stops++;}};
    sources.push(source);return source;
  }};
  const env={console,location:{protocol:"http:"},isSecureContext:true,
    context:()=>ctx,pianoSamples:new Map([[48,{}]]),pianoOutput:{},loadPianoSamples:()=>options.loading||Promise.resolve(),nearestPianoSample:()=>({midi:48,file:"C3.mp3"}),
    setTimeout(fn,ms){timers.set(++sequence,{fn,ms});return sequence;},clearTimeout:id=>timers.delete(id),
    navigator:options.unsupported?{}:{requestMIDIAccess:async args=>{requests++;assert.equal(args.sysex,false);if(options.rejected)throw Object.assign(Error("denied"),{name:"NotAllowedError"});return options.permission||access;}}
  };
  vm.runInNewContext(code,env);
  const create=()=>env.ChordInstrument.create({canPlay:()=>enabled,onStatus:s=>statuses.push(s),onError:e=>errors.push(e),onNotes:n=>notes.push(Array.from(n))});
  const player=create();
  return {player,create,input,access,sources,timers,statuses,errors,notes,requests:()=>requests,setEnabled:v=>enabled=v};
}

test("MIDI connects on request, plays individual notes and handles velocity-zero note-off",async()=>{
  const h=setup();assert.equal(h.requests(),0);
  await h.player.connect();assert.equal(h.requests(),1);
  for(const note of [48,52,55,58])send(h.input,0x90,note,96);
  await flush();assert.equal(h.sources.length,4);assert.deepEqual(h.notes.at(-1),[48,52,55,58]);
  send(h.input,0x90,48,0);assert.equal(h.sources[0].stops,1);
  send(h.input,0x80,52,64);assert.equal(h.sources[1].stops,1);
  assert.deepEqual(h.notes.at(-1),[55,58]);
  h.player.stop();assert.deepEqual(h.notes.at(-1),[]);assert.ok(h.sources.every(s=>s.stops===1));
});

test("manual button plays the whole chord without requesting MIDI, and cancels its release timers",async()=>{
  const h=setup();h.player.playChord([49,53,56,60],1.25);await flush();
  assert.equal(h.requests(),0);assert.equal(h.sources.length,4);assert.equal(h.timers.size,4);
  for(const {ms} of h.timers.values())assert.equal(ms,1250);
  h.player.stop();assert.equal(h.timers.size,0);assert.ok(h.sources.every(s=>s.stops===1));
  h.setEnabled(false);h.player.playChord([48,52,55,58],1);await flush();assert.equal(h.sources.length,4);
});

test("sustain and all-notes-off respect MIDI channels and unplug releases the device",async()=>{
  const h=setup();await h.player.connect();
  send(h.input,0xb0,64,127);send(h.input,0x90,60,96);send(h.input,0x91,60,96);await flush();
  send(h.input,0x80,60,0);send(h.input,0x81,60,0);
  assert.equal(h.sources[0].stops,0);assert.equal(h.sources[1].stops,1);
  send(h.input,0xb0,64,0);assert.equal(h.sources[0].stops,1);
  send(h.input,0x90,48,80);send(h.input,0x91,55,80);await flush();send(h.input,0xb0,123,0);
  assert.equal(h.sources[2].stops,1);assert.equal(h.sources[3].stops,0);
  h.input.state="disconnected";h.access.dispatchEvent(new Event("statechange"));
  assert.equal(h.sources[3].stops,1);assert.deepEqual(h.notes.at(-1),[]);assert.match(h.statuses.at(-1),/未发现/);
  h.input.state="connected";h.access.dispatchEvent(new Event("statechange"));send(h.input,0x90,60,80);await flush();
  assert.equal(h.sources.length,5);
});

test("released or cancelled notes never start after asynchronous audio loading",async()=>{
  let loaded;const loading=new Promise(resolve=>loaded=resolve),h=setup({loading});await h.player.connect();
  send(h.input,0x90,60,96);send(h.input,0x80,60,0);
  h.player.playChord([48,52,55,58],1);h.player.stop();loaded();await flush();
  assert.equal(h.sources.length,0);assert.equal(h.timers.size,0);
});

test("course changes remove old listeners and reuse the granted MIDI connection",async()=>{
  const h=setup();await h.player.connect();send(h.input,0x90,60,90);await flush();h.player.dispose();
  assert.equal(h.sources[0].stops,1);
  send(h.input,0x90,62,90);await flush();assert.equal(h.sources.length,1);
  const next=h.create();send(h.input,0x90,64,90);await flush();assert.equal(h.sources.length,2);
  assert.equal(h.requests(),1);next.dispose();
});

test("unsupported or denied MIDI leaves the manual chord button usable",async()=>{
  for(const options of [{unsupported:true},{rejected:true}]){
    const h=setup(options);await h.player.connect();assert.match(h.statuses.at(-1),/不支持|未获准/);
    h.player.playChord([48,52,55,58],1);await flush();assert.equal(h.sources.length,4);
  }
});

test("permission resolving after leaving the lesson does not attach a stale MIDI listener",async()=>{
  let grant;const permission=new Promise(resolve=>grant=resolve),h=setup({permission});
  const connecting=h.player.connect();h.player.dispose();grant(h.access);await connecting;
  send(h.input,0x90,60,90);await flush();assert.equal(h.sources.length,0);
});
