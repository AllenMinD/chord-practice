(function(root){
  "use strict";
  const node=typeof module!=="undefined"&&module.exports;
  const factory=node?require("./practice-model.js"):root.PracticeModel;
  const justTwo=node?require("./just-two-model.js"):root.JustTwoStudy;
  const data=node?require("./practice-song-data.js"):root.PracticeSongData;
  const studies=[justTwo,...data.map(factory.create)];
  const bySong=new Map(studies.map(study=>[study.config.song,study]));
  const anchor=study=>study.config.id==="just-two"?"just-two-study":`${study.config.id}-study`;
  const api={studies,forSong:song=>bySong.get(song),anchor,fromAnchor:value=>studies.find(study=>anchor(study)===value.replace(/^#/,""))};
  if(node)module.exports=api;else root.PracticeCatalog=api;
})(typeof globalThis!=="undefined"?globalThis:this);
