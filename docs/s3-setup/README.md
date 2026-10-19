# YouZell S3 Setup (new AWS account)

Your backend uploads listing/profile images with `PutObject` and returns public URLs like:

`https://<bucket>.s3.eu-north-1.amazonaws.com/<folder><filename>`

So the bucket needs:

1. Private write (only your IAM user / backend)
2. Public read (so the mobile app and admin can display images)
3. CORS (safe for browsers loading images / future direct uploads)

Region used by the app: **eu-north-1**

> The old bucket `youzell-app` is on the suspended account. Create a **new** bucket name if that one is still reserved (for example `youzell-media-prod`).

---

## 1. Create the bucket (Console)

1. AWS Console → **S3** → **Create bucket**
2. **Bucket name:** e.g. `youzell-media-prod` (must be globally unique)
3. **AWS Region:** `Europe (Stockholm) eu-north-1`
4. **Object Ownership:** ACLs disabled (recommended)
5. **Block Public Access:** uncheck **Block all public access**  
   - Confirm the warning (required for public image URLs)
6. Create bucket

---

## 2. Bucket policy (public read only)

S3 → your bucket → **Permissions** → **Bucket policy** → paste `bucket-policy.json`  
Replace `YOUR_BUCKET_NAME` with the real bucket name.

This allows anyone to **read** objects, but not upload/delete.

---

## 3. CORS

S3 → **Permissions** → **Cross-origin resource sharing (CORS)** → paste `cors.json`

---

## 4. IAM user for the backend

1. IAM → **Users** → Create user (e.g. `youzell-backend-s3`)
2. Attach policy from `iam-backend-s3-policy.json` (inline or customer managed)  
   Replace `YOUR_BUCKET_NAME`
3. Create **Access key** → Application running outside AWS
4. Copy Access Key ID + Secret

---

## 5. Update backend env on EC2

In `~/support-backend/env/.env.production`:

```env
AWS_S3_BUCKET=YOUR_BUCKET_NAME
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

Then:

```bash
pm2 restart support-backend --update-env
```

Also update local `support-backend/.env` and `env/.env.production` if you develop locally.

---

## Security notes

- Do **not** put `s3:PutObject` in the public bucket policy.
- Prefer rotating keys if they were ever committed to git.
- Optional later: CloudFront + private bucket for tighter control.
