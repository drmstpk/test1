import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBi4R5J3DfW8xBXbM9cjSmQ_Ycwlzr76W4",
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

document.addEventListener('DOMContentLoaded', function () {
    const foodContainer = document.getElementById('foodContainer');
    const drinkContainer = document.getElementById('drinkContainer');
    const otherContainer = document.getElementById('otherContainer');
    const adminSection = document.getElementById('adminSection');
    const passwordInput = document.getElementById('adminPassword');
    const loginButton = document.getElementById('loginButton');
    const selectedItemsContainer = document.getElementById('selectedItems');
    const nicknameInput = document.getElementById('nickname'); // ニックネーム入力欄

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
    }).catch((error) => {
        console.error("メニューの読み込み中にエラーが発生しました: ", error);
    });

    loginButton.addEventListener('click', function () {
        const password = passwordInput.value;
        if (password === 'admin123') {
            adminSection.style.display = 'block';
            passwordInput.value = '';

            get(menusRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const menus = snapshot.val();
                    foodContainer.innerHTML = '';
                    drinkContainer.innerHTML = '';
                    otherContainer.innerHTML = '';
                    for (let id in menus) {
                        const menu = menus[id];
                        addMenuToCategory(menu.category, menu.name, menu.price, menu.image, id, menu.tax, true);
                    }
                }
            });
        } else {
            alert('パスワードが間違っています。');
        }
    });

    document.getElementById('addMenuButton').addEventListener('click', function () {
        const menuName = document.getElementById('menuName').value;
        const menuPrice = parseInt(document.getElementById('menuPrice').value, 10);
        const menuImage = document.getElementById('menuImage').value;
        const menuCategory = document.getElementById('menuCategory').value;
        const menuTax = document.querySelector('input[name="menuTax"]:checked').value;

        if (menuName && menuPrice && menuImage && menuCategory) {
            const priceWithTax = menuTax === '10' ? Math.round(menuPrice * 1.1) : Math.round(menuPrice * 1.08);
            const newMenuRef = push(menusRef);
            const menuData = { name: menuName, price: priceWithTax, image: menuImage, category: menuCategory, tax: menuTax };

            set(newMenuRef, menuData).then(() => {
                addMenuToCategory(menuCategory, menuName, priceWithTax, menuImage, newMenuRef.key, menuTax, true);
                document.getElementById('menuName').value = '';
                document.getElementById('menuPrice').value = '';
                document.getElementById('menuImage').value = '';
                document.getElementById('menuCategory').value = '';
            }).catch((error) => {
                console.error("メニューの保存中にエラーが発生しました: ", error);
                alert("メニューの保存に失敗しました。もう一度お試しください。");
            });
        } else {
            alert("すべての項目を入力してください。");
        }
    });

    document.getElementById('orderButton').addEventListener('click', function () {
        let orderItems = [];
        let totalPrice = 0;
        const nickname = nicknameInput.value.trim();

        if (!nickname) {
            alert("ニックネームを入力してください。");
            return;
        }

        for (let key in selectedItems) {
            if (selectedItems[key].count > 0) {
                const item = selectedItems[key];
                orderItems.push({ name: item.name, price: item.price, count: item.count });
                totalPrice += item.count * item.price;
            }
        }

        if (orderItems.length > 0) {
            const orderData = {
                nickname: nickname,
                items: orderItems,
                total: totalPrice,
                date: new Date().toLocaleString()
            };

            const ordersRef = ref(database, 'orders');
            push(ordersRef, orderData)
                .then(() => {
                    alert("注文が確定しました！PayPayに移動します。");
                    window.location.href = `paypay://pay?amount=${totalPrice}`;
                })
                .catch((error) => {
                    console.error("注文の保存中にエラーが発生しました: ", error);
                    alert("注文の保存に失敗しました。もう一度お試しください。");
                });
        } else {
            alert("メニューを選択してください。");
        }
    });

    function addMenuToCategory(category, name, price, image, id, tax, isAdmin) {
        const container = category === 'フード' ? foodContainer :
                          category === 'ドリンク' ? drinkContainer : otherContainer;
        const menuItem = document.createElement('div');
        menuItem.classList.add('menu-item');

        const menuImageElement = document.createElement('img');
        menuImageElement.src = image;
        menuImageElement.alt = name;

        const menuNameElement = document.createElement('p');
        menuNameElement.textContent = name;

        const menuPriceElement = document.createElement('p');
        menuPriceElement.classList.add('price');
        menuPriceElement.textContent = `\u00a5${price} (税込)`;

        const quantityControls = document.createElement('div');
        quantityControls.classList.add('quantity-controls');

        const minusButton = document.createElement('button');
        minusButton.textContent = '-';
        minusButton.addEventListener('click', function () {
            if (!selectedItems[id]) {
                selectedItems[id] = { name, price, count: 0 };
            }
            selectedItems[id].count = Math.max(0, selectedItems[id].count - 1);
            updateSelectedItems();
        });

        const quantityDisplay = document.createElement('span');
        quantityDisplay.textContent = selectedItems[id]?.count || '0';

        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.addEventListener('click', function () {
            if (!selectedItems[id]) {
                selectedItems[id] = { name, price, count: 0 };
            }
            selectedItems[id].count += 1;
            updateSelectedItems();
        });

        quantityControls.appendChild(minusButton);
        quantityControls.appendChild(quantityDisplay);
        quantityControls.appendChild(plusButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.type = 'button';
        deleteButton.style.display = isAdmin ? 'inline' : 'none';
        deleteButton.addEventListener('click', function () {
            const menuRef = ref(database, `menus/${id}`);
            set(menuRef, null).then(() => {
                container.removeChild(menuItem);
            }).catch((error) => {
                console.error("メニューの削除中にエラーが発生しました: ", error);
            });
        });

        menuItem.appendChild(menuImageElement);
        menuItem.appendChild(menuNameElement);
        menuItem.appendChild(menuPriceElement);
        menuItem.appendChild(quantityControls);
        menuItem.appendChild(deleteButton);

        container.appendChild(menuItem);

        function updateSelectedItems() {
            let totalQuantity = 0;
            let totalPrice = 0;
            selectedItemsContainer.innerHTML = '<h3>選択された商品</h3>';

            for (let key in selectedItems) {
                if (selectedItems[key].count > 0) {
                    const item = selectedItems[key];
                    totalQuantity += item.count;
                    totalPrice += item.count * item.price;
                    selectedItemsContainer.innerHTML += `<p>${item.name} x${item.count} (\u00a5${item.price * item.count})</p>`;
                }
            }

            // コピー用ボタンの追加
            const copyButton = document.createElement('button');
            copyButton.textContent = '合計金額をコピー';
            copyButton.addEventListener('click', function () {
                navigator.clipboard.writeText(`${totalPrice}`);
                alert('合計金額をコピーしました！');
            });

            selectedItemsContainer.innerHTML += `<hr><p>合計: ${totalQuantity}点 (\u00a5${totalPrice})</p>`;
            selectedItemsContainer.appendChild(copyButton);
        }
    }
});
