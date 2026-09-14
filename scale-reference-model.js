(function(root) {
  "use strict";
  const right = [1,2,3,1,2,3,4,5], left = [5,4,3,2,1,3,2,1];
  const scales = [
    {id:"c-major",name:"C 大调",type:"major",names:["C","D","E","F","G","A","B"],root:60},
    {id:"g-major",name:"G 大调",type:"major",names:["G","A","B","C","D","E","F♯"],root:67},
    {id:"d-major",name:"D 大调",type:"major",names:["D","E","F♯","G","A","B","C♯"],root:62},
    {id:"f-major",name:"F 大调",type:"major",names:["F","G","A","B♭","C","D","E"],root:65,right:[1,2,3,4,1,2,3,4]},
    {id:"bb-major",name:"B♭ 大调",type:"major",names:["B♭","C","D","E♭","F","G","A"],root:70,right:[2,1,2,3,1,2,3,4],left:[3,2,1,4,3,2,1,3]},
    {id:"a-minor",name:"A 自然小调",type:"minor",names:["A","B","C","D","E","F","G"],root:69},
    {id:"e-minor",name:"E 自然小调",type:"minor",names:["E","F♯","G","A","B","C","D"],root:64},
    {id:"d-minor",name:"D 自然小调",type:"minor",names:["D","E","F","G","A","B♭","C"],root:62}
  ].map(scale=>({...scale,right:scale.right || [...right],left:scale.left || [...left]}));
  function get(id,hand="right") {
    const scale=scales.find(s=>s.id===id);
    if(!scale || !["right","left"].includes(hand))throw Error("未知音阶或手别");
    const steps=scale.type==="major"?[0,2,4,5,7,9,11,12]:[0,2,3,5,7,8,10,12];
    return {...scale,notes:steps.map(n=>scale.root+n-(hand==="left"?24:0)),names:[...scale.names,scale.names[0]],fingers:[...scale[hand]],kind:hand==="left"?"bass":"treble"};
  }
  const api={scales,get};
  if(typeof module!=="undefined" && module.exports)module.exports=api;
  root.ScaleReference=api;
})(typeof globalThis!=="undefined"?globalThis:this);
