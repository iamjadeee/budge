const API_URL = "https://script.google.com/macros/s/AKfycbyIUpHhECcf-X3Q59hLGk9PgWZkCZOsugBBzn4mdPBY2VYpH3jyuLdgW0JwVmDqaWY6yw/exec";

// 切換頁籤
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');

    if (tabName === 'report') {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => drawChart(data))
            .catch(err => console.error("讀取圖表資料錯誤", err));
    }
}

// 載入支出紀錄
async function loadRecords() {
    try {
        const response = await fetch(API_URL);
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

// 立刻插入一筆紀錄
function appendRecordToList(record) {
    const { date, category, amount, note } = record;

    const recordElement = document.createElement("div");
    recordElement.classList.add("record");
    recordElement.innerHTML = `
        <p><strong>日期：</strong>${date}</p>
        <p><strong>類別：</strong>${category}</p>
        <p><strong>金額：</strong>${amount}</p>
        <p><strong>備註：</strong>${note}</p>
    `;

    const recordsContainer = document.getElementById("recordsList");
    recordsContainer.insertBefore(recordElement, recordsContainer.firstChild);
}

// 分類統計
function calculateChartData(records) {
    const categoryTotals = { '飲食': 0, '交通': 0, '娛樂': 0, '其他': 0 };
    for (let i = 1; i < records.length; i++) {
        const [_, category, amount] = records[i];
        if (categoryTotals.hasOwnProperty(category)) {
            categoryTotals[category] += Number(amount);
        }
    }

    return {
        labels: Object.keys(categoryTotals),
        data: Object.values(categoryTotals)
    };
}

// 繪製圓餅圖
function drawChart(records) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    const { labels, data } = calculateChartData(records);

    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

    window.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#FF9999', '#66B3FF', '#99FF99', '#FFCC99'],
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} 元`
                    }
                }
            }
        }
    });
}

// 表單提交處理
document.getElementById("recordForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const note = document.getElementById("note").value;
    const newRecord = { date, category, amount, note };

    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(newRecord),
            headers: { "Content-Type": "application/json" },
            mode: "no-cors" // 不能用 response.json()
        });

        // ⚠️ 不再讀取回傳結果，直接顯示成功並新增
        alert("記帳成功！");
        document.getElementById("recordForm").reset();
        appendRecordToList(newRecord);
    } catch (error) {
        console.error("錯誤:", error);
        alert("資料傳送失敗，請稍後再試");
    }
});


// 初始畫面載入
window.addEventListener("load", () => {
    showTab("records");
    loadRecords();
});
