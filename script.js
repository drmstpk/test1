import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBi4R...",
    authDomain: "test2-802ce.firebaseapp.com",
    databaseURL: "https://test2-802ce-default-rtdb.firebaseio.com",
    projectId: "test2-802ce",
    storageBucket: "test2-802ce.appspot.com",
    messagingSenderId: "624514936023",
    appId: "1:624514936023:web:cbbd8f7a89450b86e8d492",
    measurementId: "G-5H39DWSK3Y"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOMContentLoadedイベントで動作を初期化
document.addEventListener('DOMContentLoaded', function () {
    const foodContainer = document.getElementById('foodContainer');
    const drinkContainer = document.getElementById('drinkContainer');
    const otherContainer = document.getElementById('otherContainer');
    const adminSection = document.getElementById('adminSection');
    const passwordInput = document.getElementById('adminPassword');
    const loginButton = document.getElementById('loginButton');
    const selectedItemsContainer = document.getElementById('selectedItems');
    const nicknameInput = document.getElementById('nickname');
    let selectedItems = {};

    const menusRef = ref(database, 'menus');
    get(menusRef).then((snapshot) => {
        if (snapshot.exists()) {
            const menus = snapshot.val();
            for (let id in menus) {
                const menu = menus[id];
                addMenuToCategory(menu.category, menu.name, menu.price, menu.image, id, menu.tax, false);
            }
        }
    });

    loginButton.addEventListener('click', function () {
        // 管理者ログイン処理
    });

    document.getElementById('addMenuButton').addEventListener('click', function () {
        // メニュー追加処理
    });

    document.getElementById('orderButton').addEventListener('click', function () {
        // 注文処理
    });

    function addMenuToCategory(category, name, price, image, id, tax, isAdmin) {
        // メニューをDOMに追加する関数
    }
});
