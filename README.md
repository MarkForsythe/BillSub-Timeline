# BillSub Timeline

A clean, visual, timeline-based bill and subscription tracker designed to reduce financial anxiety and help you understand your recurring expenses over time.

Most budgeting apps show lists and charts. **BillSub Timeline shows your money across time**, letting you *see* when charges land, how they stack, how trials become paid plans, and how your total financial load changes from day to day.

Built with React + Tauri (desktop app).

---

## 🌟 Features

### 🗓️ Timeline-Based View  
Subscriptions and bills are displayed on a horizontal multi-month timeline that makes it easy to see:

- Due dates  
- Clustering (multiple bills on the same day)  
- Trial → active transitions  
- Future price changes  
- Canceled subscriptions still running through end-of-cycle  

---

### 📊 Cumulative Cost Chart  
A top-of-screen interactive chart shows how your expenses accumulate over time.

Choose between:
- **Linear Accrual Mode** (smooth increasing cost, pro-rated daily)
- **Bill-to-Bill Mode** (cost increases only when charges actually occur)
- **Future Obligations Mode** (how much you will owe between now and any date you hover)

This visualization reveals your financial “pressure zones” so you can plan ahead.

---

### 💡 Smart Hover Indicators  
Hovering over any point in the timeline shows:

- Total cost up to that point (mode dependent)
- Which bills are active
- A per-item tooltip showing details of each subscription

---

### 🎛️ Flexible Cost Modes  
Choose how the cost should be represented:

1. **Bill Hit Mode**  
   Shows charges exactly when they occur.

2. **Linear/Accrual Mode**  
   Shows cost accumulating smoothly across a billing cycle.

3. **Future-Only Mode**  
   Shows only the amount you still owe from today forward.

---

### 🌙 Dark Mode  
Automatic theme persistence using app storage.

---

### 💾 Local Storage Persistence  
All your subscriptions and settings are stored locally. No accounts, no cloud required.

---

### ⚠️ Trial & Renewal Warnings  
BillSub Timeline highlights:

- Free trials ending soon  
- Price increases  
- Subscriptions set to auto-cancel  
- Upcoming heavy financial periods  

---

## 🛠️ Installation

### Windows  
Download the latest release `.exe` from the **Releases** page on GitHub and run it.

### macOS / Linux  
(Tauri build instructions will be added in future updates.)

---

## 🚀 Running from Source

```bash
npm install
npm run tauri dev
Build production desktop app:

bash
Copy code
npm run tauri build
🤝 Contributing
Contributions are welcome!
Open an issue, suggest features, or submit a pull request.

📜 License
MIT License — free for personal and commercial use.
Attribution appreciated but not required.

❤️ Why This Exists
This project was created to alleviate subscription/bill anxiety by making financial timelines visual instead of abstract.

Seeing your upcoming expenses laid out across months can turn chaos into clarity.

If this app helps you, consider starring the repo or sharing it with someone who might benefit.