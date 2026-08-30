# 🏛️ MPLADS AI Surveillance & Citizen Ground Truth Portal

> **Next-Generation GovTech Intelligence Platform for Real-Time Fund Surveillance, Geospatial Anomaly Detection, and Crowdsourced Citizen Auditing.**  
> *Contextualized for District Administration Ghaziabad, Uttar Pradesh & MoSPI.*

---

## 📌 Overview

The **MPLADS AI Surveillance & Citizen Ground Truth Portal** is a full-stack GovTech platform designed to eliminate leakages, duplicate project sanctions, and unmonitored delays in Member of Parliament Local Area Development Scheme (MPLADS) projects.

By merging **4K Satellite GIS mapping**, **automated spatial & fiscal anomaly algorithms**, and a **Jan Sunwai citizen photo proof audit trail**, the portal enables a closed-loop governance workflow from the central ministry down to on-ground citizens.

---

## ✨ Key Features

- **🛰️ 4K Satellite GIS Interactive Heatmap**: Real-time geospatial mapping of infrastructure works with 3D terrain angles and risk-intensity clustering.
- **🤖 AI Anomaly & Fraud Detection**:
  - **Geo-Duplicate Detection**: Haversine distance clustering flags duplicate project sanctioning (<100m in the same sector).
  - **Fiscal & Timeline Variance**: Automatically detects budget inflation (>20%) and severe execution delays (>40%).
- **📸 Jan Sunwai Citizen Ground Truth (Photo Proof)**:
  - Citizens submit geotagged photo evidence of project conditions on the ground.
  - Community upvoting mechanism and official administrative verification by the CDO/DM.
- **👥 Multi-Tier Role Governance**:
  - **Member of Parliament (MP)**: Mark *"Inspection from MP ⭐"* priority vigilance and dispatch statutory notices.
  - **District Magistrate (DM) / CDO**: Record mandatory on-site inspection certificates and compliance audits.
  - **State Nodal Authority (SNA) & MoSPI**: Centralized fund allocation and vigilance directives.
  - **Implementing Agencies (PWD, Jal Nigam)**: Live execution milestones and expenditure updates.
- **🌐 Full Bilingual Support (EN / HI)**: One-click toggle between English and Hindi across all dashboards and reports.
- **💬 AI Surveillance Assistant**: Natural language query engine answering complex queries about site risks, contractors, and budget overruns.

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, MapLibre GL, Lucide Icons
- **Backend**: FastAPI (Python 3.10+), Pydantic v2, Uvicorn
- **Data Layer & Services**: Dynamic Python Service Layer, RESTful Endpoints, Schema-validated JSON stores
- **AI / Analytics**: Spatial Haversine clustering, fiscal variance regression algorithms, NLP Query Engine

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Launch (Windows)
Double-click on the `start.bat` file in the root directory. It will automatically start both the backend API and frontend dev server.

### Option 2: Manual / Terminal Setup

#### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

#### 2. Install dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
pip install -r backend/requirements.txt
```

#### 3. Run full-stack dev servers
```bash
npm run dev
```

- **Web Dashboard**: `http://localhost:5173`
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger API Docs**: `http://127.0.0.1:8000/docs`

---

## 👥 Demo Role Logins

Test the multi-stakeholder governance workflows using these pre-configured role personas:

| Role | Email | Key Capabilities |
| :--- | :--- | :--- |
| **Member of Parliament (MP)** | `mp.ghaziabad@sansad.nic.in` | MP Inspection Flags, Statutory Notice Dispatch |
| **District Magistrate (DM)** | `dm.ghaziabad@up.gov.in` | On-Site Inspection Recording, Compliance Certification |
| **State Nodal Authority (SNA)** | `sna.mplads@up.gov.in` | State-level vigilance directives |
| **Central Ministry (MoSPI)** | `mospi.mplads@nic.in` | Central fund tracking & policy audits |
| **Implementing Agency (PWD)** | `pwd.ghaziabad@up.gov.in` | Work progress & milestone reporting |
| **Public Citizen** | `citizen.ghaziabad@gmail.com` | Jan Sunwai photo proof submissions & upvotes |

---

## 📄 License
This project is open-source and built for public transparency and civic governance.
