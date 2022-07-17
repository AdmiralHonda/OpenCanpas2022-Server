//var isProcessing = false //問い合わせ中にinvokeが複数回走るのを防ぐ処置

//Unzipper
/*
document.querySelector('#addBtn').addEventListener('click', async () => {
  var args = { userInput: document.querySelector('#foodinput').value };

  if (isProcessing) return;
  isProcessing = true;
  var { datas } = await window.requires.ipcRenderer.invoke('test', args);
  console.log(datas)
  isProcessing = false;
  //console.log(datas.match);
  //console.log(datas.sim_word_list);
})
*/