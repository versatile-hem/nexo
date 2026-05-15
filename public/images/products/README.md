# Product Reference Images

This directory stores reference PNG images for products.

## Directory Structure

```
public/images/products/
├── README.md (this file)
└── [product-id].png (product reference images)
```

## Usage

1. **Adding Product Images:**
   - Place product PNG files in this directory
   - Name files as: `{product-id}.png` or `{product-sku}.png`
   - Example: `PROD-001.png`, `SKU-TEST-001.png`

2. **Referencing in Code:**
   - Images in `public/` directory are served as static assets
   - Access from app: `/images/products/{filename}`
   
   Example:
   ```typescript
   <img src="/images/products/PROD-001.png" alt="Product" />
   ```

3. **Supported Formats:**
   - PNG (recommended)
   - JPG/JPEG
   - WebP
   - GIF

## Best Practices

- Keep image sizes optimized (recommended: max 500KB per image)
- Use consistent naming convention for easy reference
- Provide alt text for accessibility
- Consider creating subdirectories if you have many products:
  ```
  public/images/products/
  ├── electronics/
  ├── books/
  ├── toys/
  └── ...
  ```
