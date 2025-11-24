import { Router } from 'express';
import { db } from '../db';
import { advertisingPixels } from '../../shared/schema';
import { createPixelSchema, updatePixelSchema } from '../validation/pixels';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pixels = await db.select().from(advertisingPixels).orderBy(advertisingPixels.platform);
    res.json(pixels);
  } catch (error: any) {
    console.error('Error fetching pixels:', error);
    res.status(500).json({ error: 'Failed to fetch pixels' });
  }
});

router.get('/enabled', async (req, res) => {
  try {
    const pixels = await db
      .select()
      .from(advertisingPixels)
      .where(eq(advertisingPixels.isEnabled, true));
    res.json(pixels);
  } catch (error: any) {
    console.error('Error fetching enabled pixels:', error);
    res.status(500).json({ error: 'Failed to fetch enabled pixels' });
  }
});

router.post('/', async (req, res) => {
  try {
    const validatedData = createPixelSchema.parse(req.body);
    
    const [newPixel] = await db
      .insert(advertisingPixels)
      .values({
        platform: validatedData.platform,
        pixelId: validatedData.pixel_id,
        isEnabled: validatedData.is_enabled,
      })
      .returning();
    
    res.status(201).json(newPixel);
  } catch (error: any) {
    console.error('Error creating pixel:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create pixel' });
    }
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updatePixelSchema.parse(req.body);
    
    const updateData: any = {};
    if (validatedData.pixel_id !== undefined) {
      updateData.pixelId = validatedData.pixel_id;
    }
    if (validatedData.is_enabled !== undefined) {
      updateData.isEnabled = validatedData.is_enabled;
    }
    updateData.updatedAt = new Date();
    
    const [updatedPixel] = await db
      .update(advertisingPixels)
      .set(updateData)
      .where(eq(advertisingPixels.id, id))
      .returning();
    
    if (!updatedPixel) {
      res.status(404).json({ error: 'Pixel not found' });
      return;
    }
    
    res.json(updatedPixel);
  } catch (error: any) {
    console.error('Error updating pixel:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update pixel' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedPixel] = await db
      .delete(advertisingPixels)
      .where(eq(advertisingPixels.id, id))
      .returning();
    
    if (!deletedPixel) {
      res.status(404).json({ error: 'Pixel not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting pixel:', error);
    res.status(500).json({ error: 'Failed to delete pixel' });
  }
});

export default router;
