// 切換顯示的頁面（支出紀錄或支出報表）
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // 顯示選中的頁面和對應的按鈕
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
}

// 載入記帳紀錄
async function loadRecords() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbzOfqGJi8M3wLYkIqZQ_0t7ZqUwZ70EZZo64uZUg4PeZ5vlNtTtPrafuNTacHLWxx2yAw/exec");
        const data = await response.json();

        const recordsContainer = document.getElementById("recordsList");
        recordsContainer.innerHTML = "";

        for (let i = 1; i < data.length; i++) {
            const [date, category, amount, note] = data[i];

            const recordElement = document.createElement("div");
            recordElement.classList.add("record");
            recordElement.innerHTML = `
                <p><strong>日期：</strong>${date}</p>
                <p><strong>類別：</strong>${category}</p>
                <p><strong>金額：</strong>${amount}</p>
                <p><strong>備註：</strong>${note}</p>
            `;
            recordsContainer.appendChild(recordElement);
        }
    } catch (error) {
        console.error("讀取紀錄時發生錯誤：", error);
    }
}

// 繪製圓餅圖（支出報表）
function drawChart() {
    // 確保有 <canvas id="expenseChart"></canvas> 元素
    const ctx = document.getElementById('expenseChart');
    if (!ctx) {
        console.error("Canvas 元素未找到！");
        return; // 如果找不到Canvas，則退出
    }
    
    const chartData = {
        labels: ['飲食', '交通', '娛樂', '其他'],
        datasets: [{
            data: [20, 30, 10, 40], // 這裡假設的是一些靜態資料，之後可以替換為動態資料
            backgroundColor: ['#FF9999', '#66B3FF', '#99FF99', '#FFCC99'],
            borderColor: '#ffffff',
            borderWidth: 1
        }]
    };

    // 使用 Chart.js 繪製圖表
    new Chart(ctx, {
        type: 'pie', // 設定為圓餅圖
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', // 圖例顯示在上方
                },
                tooltip: {
                    callbacks: {
                        // 顯示每個區塊的百分比
                        label: function(tooltipItem) {
                            return tooltipItem.label + ": " + tooltipItem.raw + "%";
                        }
                    }
                }
            }
        }
    });
}


// 表單送出
document.getElementById("recordForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const note = document.getElementById("note").value;

    const newRecord = { date, category, amount, note };

    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbzOfqGJi8M3wLYkIqZQ_0t7ZqUwZ70EZZo64uZUg4PeZ5vlNtTtPrafuNTacHLWxx2yAw/exec", {
            method: "POST",
            body: JSON.stringify(newRecord),
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            alert("記帳成功！（請到 Google Sheets 查看資料）");
            document.getElementById("recordForm").reset();
            setTimeout(loadRecords, 2000); // 延遲載入紀錄
        } else {
            throw new Error("記帳失敗，請稍後再試");
        }
    } catch (error) {
        console.error("錯誤:", error);
        alert(error.message);
    }
});

// 頁面載入後自動顯示支出紀錄與支出報表
window.addEventListener('load', function() {
    showTab('records');
    loadRecords();
    drawChart();
});
