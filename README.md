
 # **Gala Night Website**  
This is a modern **event registration and management system** built with **React, TypeScript, and Supabase**. The application allows users to **register for events, make payments, and receive tickets**.  

## **Features**  
✅ User authentication (**register, login, logout**)  
✅ Payment tracking system  
✅ Receipt upload functionality  
✅ Ticket generation with QR codes  
✅ Admin panel for **payment approval and seat assignment**  

## **Getting Started**  

### **Prerequisites**  
- **Node.js** (v16 or newer)  
- **npm or yarn**  
- **Supabase account**  

### **Setup**  

#### **1. Clone the repository**  
```sh
git clone https://github.com/YOUR_USERNAME/gala-night-website.git
cd gala-night-website
```

#### **2. Install dependencies**  
```sh
npm install
# OR
yarn install
```

#### **3. Set up Supabase**  
- **Create a new Supabase project**  
- **Run the SQL initialization script** (`supabase-init.sql`) in the **Supabase SQL Editor**  
- **Create a `.env` file** in the root directory with the following variables:  

```sh
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### **4. Start the development server**  
```sh
npm run dev
# OR
yarn dev
```

## **Creating an Admin User**  
After registering a new user:  

1. **Go to your Supabase dashboard**  
2. **Navigate to the SQL Editor**  
3. **Run the following query** (replace `user_email@example.com` with the actual email of the admin user):  

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'user_email@example.com';
```

## **Database Schema**  
The application uses three main tables:  

📌 `users` - Stores user information  
📌 `payments` - Tracks payment status and receipt URLs  
📌 `tickets` - Stores ticket and seating information  

## **Storage**  
The application uses **Supabase Storage** to store payment receipts in the **`event-receipts`** bucket.  

## **Security**  
🔒 **Row-Level Security (RLS)** policies are implemented for all tables.  
🔒 **Users can only access their own data**.  
🔒 **Admin users have access to all data**.  

## **Deployment**  
### **Build the application:**  
```sh
npm run build
# OR
yarn build
```
Deploy the **`dist`** directory to your preferred hosting provider.  

## **License**  
This project is licensed under the **MIT License** – see the `LICENSE` file for details.  

---
