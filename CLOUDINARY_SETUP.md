# Cloudinary Setup

Cloudinary has been integrated for image uploads and management.

## Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=899168383227384
CLOUDINARY_API_SECRET=G-GZgrNZTFLPenChKMclx3EtNSU
```

**Note:** You need to get your `CLOUDINARY_CLOUD_NAME` from your Cloudinary dashboard. The API key and secret have been provided.

## How It Works

1. **Image Upload**: When admins upload images through the admin panel, they are uploaded to Cloudinary
2. **Image Storage**: Images are stored in the `center-for-admission-and-travels` folder in your Cloudinary account
3. **Image URLs**: Cloudinary URLs are saved in the database
4. **Image Deletion**: When images are deleted, they are removed from Cloudinary

## API Endpoints

- `POST /api/admin/images/upload` - Upload image to Cloudinary
- `DELETE /api/admin/images/delete` - Delete image from Cloudinary

## Usage

Images are automatically uploaded when:
- Admin edits images in the admin panel
- Images are replaced or updated
- New images are added to content

All image operations are handled automatically by the admin context and API routes.
