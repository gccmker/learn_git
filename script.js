/* ============================================
   学生周报生成器 - 交互逻辑
   ============================================ */

// 从 localStorage 读取历史记录
// localStorage 是浏览器提供的本地存储 API，数据以键值对形式存储
let history = JSON.parse(localStorage.getItem('weeklyReportHistory') || '[]');

/**
 * 生成周报
 * 流程：获取输入 → 校验 → 随机选文案 → 拼接展示 → 保存历史
 */
function generateReport() {
    // 获取表单元素值
    const name = document.getElementById('studentName').value.trim();
    const attendance = parseInt(document.getElementById('attendanceDays').value);
    const homework = parseInt(document.getElementById('homeworkCount').value);

    // 输入校验：姓名不能为空
    if (!name) {
        showToast('请输入学生姓名');
        return;
    }
    // 输入校验：考勤天数必须是有效数字
    if (isNaN(attendance) || attendance < 0) {
        showToast('请输入有效的考勤天数');
        return;
    }
    // 输入校验：作业完成数必须是有效数字
    if (isNaN(homework) || homework < 0) {
        showToast('请输入有效的作业完成数');
        return;
    }

    // 评价文案库：随机选取一条，增加趣味性
    const comments = [
        `${name}家长请注意！孩子这周的潜力已经藏不住了！出勤${attendance}天，作业${homework}份，这不是普通的表现，这是即将爆发的信号！现在不推一把，更待何时？！`,
        `惊了！${name}这周居然悄悄努力到了这个程度！出勤${attendance}天，作业${homework}份，别的孩子还在躺平，你家孩子已经偷偷起飞了！赶紧跟上节奏，别让孩子一个人冲刺！`,
        `${name}家长，醒醒！你家孩子这周出勤${attendance}天，作业${homework}份，这状态简直像开了挂！现在不趁热打铁，难道等孩子自己凉了才后悔吗？！`,
        `重磅消息！${name}这周的表现堪称黑马级别！出勤${attendance}天，作业${homework}份，这种势头一旦起来，拦都拦不住！家长现在就是最佳助攻手，冲！`,
        `${name}家长请查收！孩子这周出勤${attendance}天，作业${homework}份，这不是数据，这是孩子向未来发出的冲锋号！您还在犹豫什么？现在就是行动的最佳时机！`
    ];

    // 随机索引：Math.random() 返回 [0, 1)，乘以数组长度后取整
    const randomIndex = Math.floor(Math.random() * comments.length);
    
    // 拼接最终周报内容（模板字符串）
    const report = `【学生周报】${name}同学本周表现：出勤${attendance}天，完成作业${homework}份。${comments[randomIndex]}`;

    // 显示到结果区域
    const resultArea = document.getElementById('resultArea');
    resultArea.textContent = report;
    resultArea.classList.add('show'); // 添加 show 类触发显示和动画
    
    // 启用复制按钮
    document.getElementById('copyBtn').disabled = false;

    // 保存到历史记录
    saveToHistory(name, attendance, homework, report);
    showToast('周报生成成功！');
}

/**
 * 保存周报到历史记录
 * 使用 unshift 添加到数组开头（最新的在前）
 * 限制最多保存 50 条，防止 localStorage 溢出
 */
function saveToHistory(name, attendance, homework, report) {
    const record = {
        id: Date.now(), // 用时间戳作为唯一 ID
        name,
        attendance,
        homework,
        report,
        date: new Date().toLocaleString('zh-CN') // 格式化时间
    };
    
    // 添加到数组开头
    history.unshift(record);
    
    // 限制历史记录数量
    if (history.length > 50) history = history.slice(0, 50);
    
    // 持久化到 localStorage
    localStorage.setItem('weeklyReportHistory', JSON.stringify(history));
    
    // 重新渲染列表
    renderHistory();
}

/**
 * 渲染历史记录列表
 * 使用 map 将数据数组转换为 HTML 字符串
 * 空状态时显示提示文字
 */
function renderHistory() {
    const list = document.getElementById('historyList');
    
    if (history.length === 0) {
        list.innerHTML = '<div class="history-empty">暂无历史记录</div>';
        return;
    }
    
    // 将每条记录映射为 HTML 元素
    list.innerHTML = history.map(item => `
        <div class="history-item" onclick="loadHistory(${item.id})">
            <button class="history-item-delete" onclick="event.stopPropagation(); deleteHistory(${item.id})">×</button>
            <div class="history-item-header">
                <span class="history-item-name">${item.name}</span>
                <span>${item.date}</span>
            </div>
            <div class="history-item-content">${item.report}</div>
        </div>
    `).join('');
}

/**
 * 加载历史记录到展示区
 * 点击历史条目时触发
 */
function loadHistory(id) {
    const item = history.find(h => h.id === id); // 按 ID 查找
    if (item) {
        document.getElementById('resultArea').textContent = item.report;
        document.getElementById('resultArea').classList.add('show');
        document.getElementById('copyBtn').disabled = false;
        showToast('已加载历史记录');
    }
}

/**
 * 删除单条历史记录
 * 使用 filter 过滤掉目标 ID 的记录
 * event.stopPropagation() 阻止事件冒泡，避免触发 loadHistory
 */
function deleteHistory(id) {
    history = history.filter(h => h.id !== id);
    localStorage.setItem('weeklyReportHistory', JSON.stringify(history));
    renderHistory();
    showToast('已删除');
}

/**
 * 清空所有历史记录
 */
function clearHistory() {
    if (history.length === 0) return;
    history = [];
    localStorage.setItem('weeklyReportHistory', JSON.stringify(history));
    renderHistory();
    showToast('历史记录已清空');
}

/**
 * 导出历史记录为 JSON 文件
 * 原理：创建 Blob 对象 → 生成下载链接 → 触发下载
 * 文件会保存到浏览器的默认下载目录
 */
function exportHistory() {
    if (history.length === 0) {
        showToast('暂无数据可导出');
        return;
    }
    
    // 将数据转为 JSON 字符串
    const dataStr = JSON.stringify(history, null, 2);
    
    // 创建 Blob 对象（二进制大对象）
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // 生成临时下载链接
    const url = URL.createObjectURL(blob);
    
    // 创建隐藏的 <a> 元素并触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = `weekly-report-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    
    // 清理：移除元素和释放 URL 对象
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('导出成功！请查看下载文件夹');
}

/**
 * 导入历史记录
 * 触发隐藏的文件输入框，让用户选择 JSON 文件
 */
function importHistory() {
    document.getElementById('importFile').click();
}

/**
 * 处理导入的文件
 * 读取 JSON 文件 → 解析数据 → 合并到现有历史
 */
function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 使用 FileReader 读取文件内容
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // 解析 JSON 数据
            const importedData = JSON.parse(e.target.result);
            
            // 校验数据格式
            if (!Array.isArray(importedData)) {
                showToast('导入失败：数据格式错误');
                return;
            }
            
            // 合并数据：导入的数据放在前面
            history = [...importedData, ...history];
            
            // 去重：按 id 去重
            const seen = new Set();
            history = history.filter(item => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
            });
            
            // 限制数量
            if (history.length > 50) history = history.slice(0, 50);
            
            // 保存到 localStorage 并重新渲染
            localStorage.setItem('weeklyReportHistory', JSON.stringify(history));
            renderHistory();
            showToast(`导入成功！共 ${importedData.length} 条记录`);
        } catch (err) {
            showToast('导入失败：文件解析错误');
        }
    };
    
    // 以文本格式读取文件
    reader.readAsText(file);
    
    // 清空文件输入框，允许重复导入同一文件
    event.target.value = '';
}

/**
 * 复制周报到剪贴板
 * 优先使用现代 Clipboard API
 * 降级方案：创建临时 textarea 执行 document.execCommand('copy')
 */
function copyReport() {
    const report = document.getElementById('resultArea').textContent;
    
    // 尝试使用现代 API
    navigator.clipboard.writeText(report).then(() => {
        showToast('已复制到剪贴板！');
    }).catch(() => {
        // 降级方案：兼容旧浏览器
        const textarea = document.createElement('textarea');
        textarea.value = report;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('已复制到剪贴板！');
    });
}

/**
 * 显示 Toast 提示
 * 通过添加/移除 CSS 类控制动画
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    // 2秒后自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 页面加载时渲染历史记录
renderHistory();
