// Firebase 関連の読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase 設定（あなたのプロジェクトの情報に書き換えてね！）
const firebaseConfig = {
    apiKey: "AIzaSyC31W-TEE7mIBGFwrRxJAuPugjnEFfWe_k",
    authDomain: "web01-2484d.firebaseapp.com",
    projectId: "web01-2484d",
    storageBucket: "web01-2484d.firebasestorage.app",
    messagingSenderId: "90159472898",
    appId: "1:90159472898:web:8a33ef04b4474b9911e21b",
    measurementId: "G-148XJR01WS"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 匿名ログイン
const auth = getAuth();
signInAnonymously(auth).catch((error) => {
  console.error("認証エラー:", error);
});

// DOM取得
const input = document.getElementById("user-input");
const button = document.getElementById("send-btn");
const chatBox = document.getElementById("chat-box");

// Gemini API 呼び出し
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function sendMessage(message, sender = "user") {
  // Firestore に保存
  await addDoc(collection(db, "chats"), {
    message,
    sender,
    createdAt: serverTimestamp()
  });
}

async function handleUserMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  await sendMessage(userMessage, "user");

  // Gemini で返答生成
  const result = await model.generateContent([userMessage]);
  const response = result.response.text();

  await sendMessage(response, "doraemon");
}

// チャット表示
function displayMessage(message, sender) {
  const who = sender === "user" ? "👤 あなた" : "🤖 ドラえもん";
  chatBox.innerText += `${who}：${message}\n\n`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Firestoreからリアルタイム取得
const q = query(collection(db, "chats"), orderBy("createdAt"));
onSnapshot(q, (snapshot) => {
  chatBox.innerText = ""; // 一旦リセット
  snapshot.forEach((doc) => {
    const data = doc.data();
    displayMessage(data.message, data.sender);
  });
});

// ボタン動作
button.addEventListener("click", handleUserMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleUserMessage();
});
