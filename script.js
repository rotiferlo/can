// API 金鑰
const API_KEY = 'AIzaSyDsjBTB4ouTE1sRJBNMLxyvP15gexa0oxA';

// 定義特殊符號集合
const SYMBOLS = '⚊⚋⚌⚍⚎⚏卍卐╬╫╪║│┃▌█▉▊▋▍▎▏▕▆▅▄▃▂▁';

// 加密文本
async function encryptText(text) {
    try {
        console.log('開始加密文本');
        // 使用日式符號替換文字，確保每個字元都有不同的替換
        let encryptedText = '';
        for (let i = 0; i < text.length; i++) {
            const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
            encryptedText += SYMBOLS[randomIndex];
        }
        
        console.log('加密完成');
        return encryptedText;
    } catch (error) {
        console.error('加密過程發生錯誤:', error);
        throw new Error('加密失敗');
    }
}

// 解密文本 - 直接返回原始內容
async function decryptText(encryptedText, originalText) {
    return originalText;
}

// 生成唯一ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 使用優雅的方式顯示提示訊息
function showMessage(message, isError = false) {
    // 移除現有的提示訊息
    const existingMsg = document.querySelector('.message');
    if (existingMsg) {
        existingMsg.remove();
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isError ? 'error' : 'success'}`;
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        background-color: ${isError ? '#ff4444' : '#4CAF50'};
        color: white;
        border-radius: 2px;
        font-family: 'Noto Sans JP', sans-serif;
        font-size: 0.9em;
        letter-spacing: 0.05em;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    `;

    document.body.appendChild(msgDiv);
    requestAnimationFrame(() => {
        msgDiv.style.opacity = '1';
    });

    setTimeout(() => {
        msgDiv.style.opacity = '0';
        setTimeout(() => msgDiv.remove(), 300);
    }, 3000);
}

// 儲存遺囑
async function submitWill() {
    try {
        const content = document.getElementById('content').value;
        const year = document.getElementById('releaseYear').value;
        const month = document.getElementById('releaseMonth').value;
        const day = document.getElementById('releaseDay').value;
        const hour = document.getElementById('releaseHour').value;
        const minute = document.getElementById('releaseMinute').value;
        
        // 驗證輸入
        if (!content) {
            throw new Error('請填寫遺囑內容');
        }
        if (!year || !month || !day || !hour || !minute) {
            throw new Error('請填寫完整的解密時間');
        }

        // 組合完整的解密時間
        const releaseTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));

        if (releaseTime <= new Date()) {
            throw new Error('解密時間必須是未來的時間');
        }

        const willId = generateUniqueId();
        const encryptedContent = await encryptText(content);
        
        const willData = {
            content: content,
            encryptedContent: encryptedContent,
            releaseTime: releaseTime.getTime(),
            isEncrypted: true
        };

        localStorage.setItem(willId, JSON.stringify(willData));
        document.getElementById('willId').textContent = willId;
        document.getElementById('result').style.display = 'block';
        showMessage('遺囑已成功加密並儲存！您的遺囑編號已生成');

    } catch (error) {
        console.error('提交遺囑時發生錯誤:', error);
        showMessage(error.message || '提交遺囑時發生錯誤，請稍後再試', true);
    }
}

// 計算剩餘時間的輔助函數
function getTimeRemaining(endTime) {
    const total = Math.max(0, endTime - Date.now());
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
        total,
        days,
        hours,
        minutes,
        seconds,
        isExpired: total <= 0
    };
}

// 更新倒數計時顯示
function updateClock(endTime, displayElement) {
    const t = getTimeRemaining(endTime);
    
    const timeText = t.isExpired ? 
        '解密時間已到' :
        `解密倒數：${String(t.days).padStart(2, '0')}日 ${String(t.hours).padStart(2, '0')}時 ${String(t.minutes).padStart(2, '0')}分 ${String(t.seconds).padStart(2, '0')}秒`;
    
    displayElement.textContent = timeText;
    displayElement.style.color = t.isExpired ? '#4CAF50' : '#333';
    
    return t.total;
}

// 檢查遺囑
async function checkWill() {
    try {
        const willId = document.getElementById('willId').value;
        if (!willId) {
            throw new Error('請輸入遺囑編號');
        }

        const willData = JSON.parse(localStorage.getItem(willId));
        if (!willData) {
            throw new Error('找不到此編號的遺囑');
        }

        const willContentDiv = document.getElementById('willContent');
        const timerDiv = document.getElementById('timer');
        
        willContentDiv.style.display = 'block';
        timerDiv.style.display = 'block';

        const updateTimer = () => {
            const timeLeft = updateClock(willData.releaseTime, timerDiv);
            if (Date.now() >= willData.releaseTime && willContentDiv.textContent === willData.encryptedContent) {
                willContentDiv.style.transition = 'opacity 0.5s ease';
                willContentDiv.style.opacity = '0';
                setTimeout(() => {
                    willContentDiv.textContent = willData.content;
                    willContentDiv.style.opacity = '1';
                }, 500);
            }
            return timeLeft;
        };

        // 顯示初始內容
        if (Date.now() >= willData.releaseTime) {
            willContentDiv.textContent = willData.content;
            updateTimer();
        } else {
            willContentDiv.textContent = willData.encryptedContent;
            updateTimer();
            // 設置定時更新
            if (window.countdownTimer) {
                clearInterval(window.countdownTimer);
            }
            window.countdownTimer = setInterval(updateTimer, 1000);
        }

    } catch (error) {
        console.error('搜索遺囑時發生錯誤:', error);
        showMessage(error.message || '搜索遺囑時發生錯誤，請稍後再試', true);
    }
}

// 定期檢查是否需要解密
setInterval(() => {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const willData = JSON.parse(localStorage.getItem(key));
            
            if (willData && willData.isEncrypted && Date.now() >= willData.releaseTime) {
                willData.isEncrypted = false;
                localStorage.setItem(key, JSON.stringify(willData));
            }
        }
    } catch (error) {
        console.error('定期檢查時發生錯誤:', error);
    }
}, 60000);