var isProcessing = false //問い合わせ中にinvokeが複数回走るのを防ぐ処置

let ingredientsList = [];

window.addEventListener('DOMContentLoaded', async function () {
  
  /*
  //以下テスト用コード
  let args0 = { userInput: "しょうゆ" }; //Query
  let retval0 = await window.requires.ipcRenderer.invoke('fixname', args0);
  console.log(retval0) //SimQueryResp

  let args1 = {};
  let retval1;
  if (retval0.match) {
    args1 = { userInput: "しょうゆ" }; //Query
    let retval1 = await window.requires.ipcRenderer.invoke('getunitlist', args1);
    console.log(retval1); //UnitList

    //検証用：不正なパラメータで送る場合
    //retval1 = await window.requires.ipcRenderer.invoke('getunitlist', { userInput: "ほげ" });
    //console.log("エラー内容");
    //console.log(retval1); //{"units": []}

    let args2 = { name: "しょうゆ", unit: "大さじ", amount: 2 } //UserLikeIngredients
    retval2 = await window.requires.ipcRenderer.invoke('exchangetog', args2);
    console.log(retval2); //Ingredient
    ingredientsList.push(retval2);

    //検証用：不正なパラメータで送ると各パラメータが空の文字列が返ってきてamountは0になる
    //retval2 = await window.requires.ipcRenderer.invoke('exchangetog', { name: "しょうゆ", unit: "エラー", amount: 100 });
    //console.log("エラー内容");
    //console.log(retval2); //{"id": "","name": "","amount": 0}

    let args3 = new Map(); //Ingredients
    args3.set(retval2.id, retval2.amount);
    let retval3 = await window.requires.ipcRenderer.invoke('getrecipe', args3);
    console.log(retval3); //Recipe

    //ここまでテスト
  }*/
});

function ingredientsTableAdd(ingredient) {
  let targetTable = document.getElementById('ingredientsTable');
  let trEl = targetTable.insertRow();
  trEl.setAttribute('class', 'bg-white dark:bg-white-0 dark:border-gray-700 hover:bg-white-0 dark:hover:bg-white-0');
  let thEl = trEl.insertCell();
  thEl.setAttribute('class', 'px-14 py-4 font-medium text-gray-900 dark:text-black whitespace-nowrap');
  thEl.setAttribute('scope', 'row');
  thEl.appendChild(document.createTextNode(ingredient[0]));
  trEl.appendChild(thEl);
  let tdEl2 = trEl.insertCell();
  tdEl2.setAttribute('class', 'px-4 py-4');
  tdEl2.appendChild(document.createTextNode(ingredient[1]));
  let tdEl3 = trEl.insertCell();
  tdEl3.setAttribute('class', 'px-4 py-4');
  tdEl3.appendChild(document.createTextNode(ingredient[2]));
  let tdEl4 = trEl.insertCell();
  tdEl4.setAttribute('class', 'px-4 py-4');
  tdEl4.hidden = true;
  tdEl4.appendChild(document.createTextNode(ingredient[3]));
  let tdEl5 = trEl.insertCell();
  tdEl5.setAttribute('class', 'w-4 p-4');
  let tdEl5Div = document.createElement('div');
  tdEl5.appendChild(tdEl5Div);
  tdEl5Div.setAttribute('class', 'flex items-center');
  let tdEl5Input = document.createElement('input');
  tdEl5Input.setAttribute('type', 'checkbox');
  tdEl5Input.setAttribute('class', 'w-4 h-4 text-black-600 bg-white-0 border-gray-300 rounded focus:ring-white-500 dark:focus:ring-white-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-white-0 dark:border-gray-600');
  tdEl5.appendChild(tdEl5Input);
  let tdEl5Label = document.createElement('label');
  tdEl5Label.setAttribute('class', 'sr-only');
}

async function pullDownAddInvoke() {
  let retval = await window.requires.ipcRenderer.invoke('getunitlist', { userInput: document.getElementById("foodinput").value });
  for (let i = 0; i < retval.units.length; i++) {
    let opt = document.createElement("option");
    opt.setAttribute('value', retval.units[i]);
    opt.appendChild(document.createTextNode(retval.units[i]));
    document.getElementById("unitselect").appendChild(opt);
  }
}

async function checkInputFormAndInvoke() {
  if (!document.getElementById("foodinput").value && !document.getElementById("unitselect").value && !document.getElementById("amountinput").value) {
    alert("左のフォームを入力してください");
  }
  else{
  let invokeArgs;
  let retval;

  invokeArgs = { name: document.getElementById("foodinput").value, unit: document.getElementById("unitselect").value, amount: document.getElementById("amountinput").value };
  retval = await window.requires.ipcRenderer.invoke('exchangetog', invokeArgs);

  ingredientsTableAdd([retval.name, invokeArgs.unit, invokeArgs.amount, retval.id]);
  let ingredient = new Map();
  ingredient.set(retval.id, retval.amount);
  ingredientsList.push(ingredient);
  cleanupForm();
  }
}

async function receipeInvoke() {
  if (ingredientsList.length > 0){
  let retval = await window.requires.ipcRenderer.invoke('getrecipe', {ingredients:ingredientsList});
  console.log(retval.title)
  //document.getElementById("iframewebsite").src = retval.url;
  }
  else {alert("食材を入力してください");}
}

/*

let foodinput = document.getElementById('foodinput');
let foodlist = []
foodinput.addEventListener('keypress', async () => {
  let args = { userInput: foodinput.value };
  if (isProcessing) return;
  isProcessing = true;

  let retval = await window.requires.ipcRenderer.invoke('fixname', args);
  console.log(retval)
  //console.log(retval.match);
  //console.log(retval.sim_word_list);
  foodlist = retval.sim_word_list;
  //[TODO]ここにmatchがtrueだった場合のデザイン変更をやる
  //if (!retval.match && foodlist.length !== 0 ) new Suggest.Local("foodinput", "foodsuggest", foodlist, { ignoreCase: false, prefix: true, highlight: true });

  isProcessing = false;
});

let unitinput = document.getElementById('unitinput');
let unitlist = [];
unitinput.addEventListener('keypress', async () => {
  let args = { userInput: unitinput.value };
  if (isProcessing) return;
  isProcessing = true;

  let retval = await window.requires.ipcRenderer.invoke('getunitlist', args);
  //unitlist = retval.sim_word_list;
  isProcessing = false;
});

let amountinput = document.getElementById('amountinput');
let amountlist = [];
amountinput.addEventListener('keypress', async () => {
  let args = { userInput: amountinput.value };
  if (isProcessing) return;
  isProcessing = true;

  let retval = await window.requires.ipcRenderer.invoke('test', args);
  console.log(retval)
  //amountlist = retval.sim_word_list;
  isProcessing = false;
});
*/

function cleanupForm() {
  document.getElementById('foodinput').value = '';
  document.getElementById('foodinput').disabled = false;
  document.getElementById('amountinput').value = '';
  let unitselect = document.getElementById("unitselect");
  if (unitselect.hasChildNodes()) {
		while (unitselect.childNodes.length > 0) {
			unitselect.removeChild(unitselect.firstChild);
		}
  }
  isFoodDecided = false;
}

$(document).ready(async function () {
  //検索フォーム
  var searchTextInputObj = $("#foodinput");
  //検索ボックスエリア
  var searchTextObj = $("#foodsearch");
  //サジェストリスト
  var suggestlistdiv = $("#foodsuggest");
  //検索フォームの初期表示文字を取得
  defaultText = searchTextInputObj.val();
  //検索フォームにフォーカス
  searchFocus(searchTextInputObj, searchTextObj, suggestlistdiv);
});
/*検索ボックスの初期値*/
var defaultText;
//フォーカス時のクラス指定
var focusClass = "focus";
//サジェスト表示時のクラス指定
var nextClass = "next";

let isFoodDecided = false;
let ingredientsRequest = [];

/*類似検索の表示*/
async function searchFocus(textInput, textBox, nextBox) {
  let retval;
  textInput
    .focus(async function () {
      //フォーカス時のクラス
      textBox.addClass(focusClass);
      console.log(document.getElementById("foodinput").value);
      let args = { userInput: document.getElementById("foodinput").value };
      retval = await window.requires.ipcRenderer.invoke('fixname', args);
      console.log(retval);
      let el = document.getElementById("foodsuggestlist");
      let childel;
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      } //全ての要素を削除
      for (let i = 0; i < retval.sim_word_list.length; i++) {
        childel = document.createElement('li');
        childel.appendChild(document.createTextNode(retval.sim_word_list[i]));
        el.appendChild(childel);
      } //suggestの結果をここに表示

      //検索ボックスの値
      var textValue = $(this).val();
      if (textValue === defaultText) {
        //デフォルトだったら
        $(this).val("");
        $(this).addClass(focusClass);
      } else if (textValue !== "") {
        //何か入っていたらサジェスト表示
        nextBox.show();
      }
    })
    .keyup(async function () {
      //キーが押されたら
      console.log(document.getElementById("foodinput").value);
      let args = { userInput: document.getElementById("foodinput").value };
      retval = await window.requires.ipcRenderer.invoke('fixname', args);
      console.log(retval);
      let el = document.getElementById("foodsuggestlist");
      let childel;
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      } //全ての要素を削除
      for (let i = 0; i < retval.sim_word_list.length; i++) {
        childel = document.createElement('li');
        childel.appendChild(document.createTextNode(retval.sim_word_list[i]));
        el.appendChild(childel);
      } //suggestの結果をここに表示

      var textValue = $(this).val();
      if (textValue !== "") {
        //何か入っていたら
        textBox.addClass(nextClass);
        nextBox.show();
      } else {
        //何もなければ(削除したら)
        textBox.removeClass(nextClass);
        nextBox.hide();
      }
    })
    .blur(async function () {
      console.log(document.getElementById("foodinput").value);
      let args = { userInput: document.getElementById("foodinput").value };
      let retval = await window.requires.ipcRenderer.invoke('fixname', args);
      console.log(retval);
      let el = document.getElementById("foodsuggestlist");
      let childel;
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      } //全ての要素を削除
      for (let i = 0; i < retval.sim_word_list.length; i++) {
        childel = document.createElement('li');
        childel.appendChild(document.createTextNode(retval.sim_word_list[i]));
        childel.addEventListener('click', async () => {
          let thisval = retval.sim_word_list[i];
          document.getElementById("foodinput").value = thisval;
          document.getElementById("foodinput").disabled = true;
          document.getElementById("foodsuggest").setAttribute('style', 'display:none;');
          let sugchk = await window.requires.ipcRenderer.invoke('fixname', { userInput: thisval });
          if (sugchk.match && !isFoodDecided) {
            isFoodDecided = true;
            pullDownAddInvoke();
          }
          else {
            isFoodDecided = false;
            //alert("[Client]An error occured.");
          }
        });
        el.appendChild(childel);
      } //suggestの結果をここに表示

      //フォーカスが外れたら
      var textValue = $(this).val();
      //何もなければ
      if (textValue === "") {
        //フォーカス、サジェストのクラスを削除
        textBox.removeClass(focusClass, nextClass);
        //デフォルトの文字を指定し、文字色も戻す
        $(this).val(defaultText);
        $(this).removeClass(focusClass);
      }
      //テキストフォームとサジェスト以外がクリックされたときに処理する
      $(document).click(async function (e) {
        if (!isFoodDecided && retval.match) {
          document.getElementById("foodinput").disabled = true;
          document.getElementById("foodsuggest").setAttribute('style', 'display:none;');
          let sugchk = await window.requires.ipcRenderer.invoke('fixname', { userInput: document.getElementById("foodinput").value });
          if (sugchk.match && !isFoodDecided) {
            isFoodDecided = true;
            pullDownAddInvoke();
          }
          else {
            isFoodDecided = false;
            //alert("[Client]An error occured.");
          }
        }
        //.closest()さかのぼって要素を探す
        if (!$(e.target).closest(textBox, nextBox).length) {
          textBox.removeClass(focusClass, nextClass);
          nextBox.hide();
        }
      });
    });
}