# 📂 Track Vault

Track Vault is a secure file storage and analytics platform built with **Next.js**, designed for effortless uploading, tracking, and managing of files. It integrates with **AWS S3** for storage and provides detailed analytics for file views and downloads.

---

## 🚀 Features

- 🔐 **Secure Authentication** – user login & session management  
- ☁️ **File Uploads to AWS S3** – supports large files with multipart upload  
- 🔒 **Private File Access** – files are stored privately, accessed via signed URLs  
- 📊 **File Analytics Dashboard**  
  - Track unique visitors  
  - Device/browser statistics  
  - Views over time with charts  
- 📥 **Download Tracking** – see when and how many times files are downloaded  
- 🎨 **Responsive UI** – built with Next.js + Tailwind CSS  
- ⚡ **Deployment on AWS EC2** – using Caddy as reverse proxy  

---

## 🛠️ Tech Stack

- **Frontend & Server**: [Next.js](https://nextjs.org/) (App Router)  
- **Storage**: [AWS S3](https://aws.amazon.com/s3/)  
- **Database**: [Supabase](https://supabase.com/)  
- **Auth**: Kinde / Supabase Auth  
- **Deployment**: AWS EC2 + Caddy  
- **Styling**: Tailwind CSS  
- **Process Management**: PM2  

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+  
- AWS S3 bucket with credentials  
- Supabase project for metadata & analytics  
- EC2 instance (for deployment)  

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/track-vault.git
cd track-vault

# Install dependencies
npm install
