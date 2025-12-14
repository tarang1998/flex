# Supabase Setup Guide for Review Approval System

## 🚀 Quick Start

### 1. Create Supabase Project

1. Visit [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Configure:
   - **Name**: `flex-reviews`
   - **Database Password**: (Save this securely!)
   - **Region**: Select closest to your location
5. Click **"Create new project"** (takes ~2 minutes)

### 2. Create Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Paste and run this SQL:

```sql
-- Create approved_reviews table
CREATE TABLE approved_reviews (
  id BIGSERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  UNIQUE(review_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_approved_reviews_listing_id ON approved_reviews(listing_id);
CREATE INDEX idx_approved_reviews_review_id ON approved_reviews(review_id);

-- Enable Row Level Security
ALTER TABLE approved_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth)
CREATE POLICY "Enable all access for approved_reviews" ON approved_reviews
  FOR ALL USING (true);
```

4. Click **"Run"** or press `Ctrl+Enter`
5. Verify success message appears

### 3. Get API Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** section
3. Copy these values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Starts with `eyJ...`

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 5. Configure Environment Variables

Update your `.env.local` file:

```env
# Existing Hostaway config
HOSTAWAY_ACCOUNT_ID=61148
HOSTAWAY_API_KEY=your_hostaway_api_key

# Add these Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key_here
```

**Important**: Replace the values with YOUR actual credentials from Step 3!

### 6. Test the Setup

Start your development server:

```bash
npm run dev
```

Test the API endpoints:

#### Approve a Review

```bash
curl -X POST http://localhost:3000/api/reviews/approval \
  -H "Content-Type: application/json" \
  -d '{
    "reviewId": 155613001,
    "listingId": 155613,
    "isApproved": true,
    "approvedBy": "manager@example.com"
  }'
```

#### Get Approved Reviews for a Listing

```bash
curl http://localhost:3000/api/reviews/approved?listingId=155613
```

## 📋 Database Schema

### `approved_reviews` Table

| Column        | Type         | Description                                 |
| ------------- | ------------ | ------------------------------------------- |
| `id`          | BIGSERIAL    | Auto-incrementing primary key               |
| `review_id`   | INTEGER      | Review ID from Hostaway/Mock data           |
| `listing_id`  | INTEGER      | Listing ID (listingMapId)                   |
| `approved_by` | VARCHAR(255) | Email/name of approver                      |
| `approved_at` | TIMESTAMP    | When review was approved                    |
| `is_approved` | BOOLEAN      | Approval status (always true in this table) |

**Constraints**:

- `UNIQUE(review_id)` - Each review can only be approved once
- Indexes on `listing_id` and `review_id` for fast queries

## 🔌 API Endpoints

### 1. Approve/Disapprove Review

**POST** `/api/reviews/approval`

**Request Body**:

```json
{
  "reviewId": 155613001,
  "listingId": 155613,
  "isApproved": true,
  "approvedBy": "manager@example.com"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Review 155613001 approved successfully",
  "data": {
    "reviewId": 155613001,
    "listingId": 155613,
    "isApproved": true,
    "approvedBy": "manager@example.com"
  }
}
```

### 2. Get Approved Review IDs

**GET** `/api/reviews/approved?listingId={id}`

**Response**:

```json
{
  "success": true,
  "data": {
    "listingId": 155613,
    "approvedReviewIds": [155613001, 155613002, 155613003],
    "count": 3
  }
}
```

## 🔒 Security Considerations

### Current Setup (Development)

- Row Level Security (RLS) is enabled
- Policy allows all operations (open access)

### For Production:

1. **Enable Authentication**:

   ```sql
   -- Update policy to require authentication
   DROP POLICY "Enable all access for approved_reviews" ON approved_reviews;

   CREATE POLICY "Authenticated users can read" ON approved_reviews
     FOR SELECT USING (auth.role() = 'authenticated');

   CREATE POLICY "Authenticated users can insert" ON approved_reviews
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

   CREATE POLICY "Authenticated users can delete" ON approved_reviews
     FOR DELETE USING (auth.role() = 'authenticated');
   ```

2. **Add User Roles**:

   - Create manager role in Supabase Auth
   - Restrict approval operations to managers only

3. **Use Service Key for Backend**:
   - Create `SUPABASE_SERVICE_KEY` for server-side operations
   - Use `anon key` only for client-side reads

## 🧪 Testing Data

Test with existing mock review IDs:

**Listing 155613 (The Bromley Collection)**:

- Review IDs: 155613001 - 155613010

**Listing 155615 (The Peckham Apartments)**:

- Review IDs: 155615001 - 155615010

**Listing 346994 (The Putney Apart 2)**:

- Review IDs: 346994001 - 346994011

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

- Check `.env.local` file exists
- Verify variable names match exactly
- Restart dev server after changes

### Error: "relation 'approved_reviews' does not exist"

- Run the SQL table creation script in Supabase SQL Editor
- Check you're connected to the correct project

### Error: "new row violates row-level security policy"

- Verify RLS policy was created correctly
- Check policy allows your operation type

### Reviews not showing as approved

- Verify data was inserted: Check Supabase Table Editor
- Check `review_id` and `listing_id` match exactly
- Review API response for errors

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database table
3. ✅ Configure environment variables
4. ✅ Test API endpoints
5. 🔜 Integrate with frontend UI
6. 🔜 Add authentication
7. 🔜 Deploy to production
