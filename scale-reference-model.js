(function(root) {
  "use strict";
  const right = [1,2,3,1,2,3,4,5], left = [5,4,3,2,1,3,2,1];
  // Ordered by the relative-key pairs in Xiong Dao'er's published contents.
  // Fingering is for a single octave; minor entries explicitly use the natural form.
  const pairs = [
    ["c", "C",60,"C D E F G A B", "a","A",69,"A B C D E F G",0],
    ["g", "G",67,"G A B C D E F♯", "e","E",64,"E F♯ G A B C D",1],
    ["f", "F",65,"F G A B♭ C D E", "d","D",62,"D E F G A B♭ C",-1],
    ["d", "D",62,"D E F♯ G A B C♯", "b","B",71,"B C♯ D E F♯ G A",2],
    ["bb","B♭",70,"B♭ C D E♭ F G A", "g","G",67,"G A B♭ C D E♭ F",-2],
    ["a", "A",69,"A B C♯ D E F♯ G♯", "fs","F♯",66,"F♯ G♯ A B C♯ D E",3],
    ["eb","E♭",63,"E♭ F G A♭ B♭ C D", "c","C",60,"C D E♭ F G A♭ B♭",-3],
    ["e", "E",64,"E F♯ G♯ A B C♯ D♯", "cs","C♯",61,"C♯ D♯ E F♯ G♯ A B",4],
    ["ab","A♭",68,"A♭ B♭ C D♭ E♭ F G", "f","F",65,"F G A♭ B♭ C D♭ E♭",-4],
    ["b", "B",71,"B C♯ D♯ E F♯ G♯ A♯", "gs","G♯",68,"G♯ A♯ B C♯ D♯ E F♯",5],
    ["db","D♭",61,"D♭ E♭ F G♭ A♭ B♭ C", "bb","B♭",70,"B♭ C D♭ E♭ F G♭ A♭",-5],
    ["gb","G♭",66,"G♭ A♭ B♭ C♭ D♭ E♭ F", "eb","E♭",63,"E♭ F G♭ A♭ B♭ C♭ D♭",-6]
  ];
  const fingerings = {
    "f-major":["12341234","54321321"],
    "bb-major":["21231234","32143213"],
    "eb-major":["31234123","32143213"],
    "ab-major":["34123123","32143213"],
    "b-major":["12312345","43214321"],
    "db-major":["23123412","32143213"],
    "gb-major":["23412312","43213214"],
    "b-minor":["12312345","43214321"],
    "fs-minor":["23123123","43213214"],
    "cs-minor":["34123123","32143213"],
    "f-minor":["12341234","54321321"],
    "gs-minor":["34123123","32132143"],
    "bb-minor":["21231234","21321432"],
    "eb-minor":["31234123","21432132"]
  };
  const scales = pairs.flatMap(pair => ["major","minor"].map((type,index) => {
    const offset=index*4, id=`${pair[offset]}-${type}`;
    const fingers=fingerings[id];
    const fifths=pair[8];
    const altered=(fifths>0?["F♯","C♯","G♯","D♯","A♯","E♯"]:["B♭","E♭","A♭","D♭","G♭","C♭"]).slice(0,Math.abs(fifths));
    return {id,name:`${pair[offset+1]} ${index?"自然小调":"大调"}`,type,
      root:pair[offset+2],names:pair[offset+3].split(" "),fifths,
      signature:fifths?`${Math.abs(fifths)} 个${fifths>0?"升":"降"}号：${altered.join("、")}`:"无升降号（全白键）",
      relativeId:`${pair[index?0:4]}-${index?"major":"minor"}`,
      right:fingers?[...fingers[0]].map(Number):[...right],
      left:fingers?[...fingers[1]].map(Number):[...left]};
  }));
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
