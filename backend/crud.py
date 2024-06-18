from sqlalchemy.orm import Session
import models
from schemas import BatchCreate

def get_weights_by_centra_id(db: Session, centra_id: int):
    return db.query(models.Weight).filter(models.Weight.centra_id == centra_id).all()

def get_batches_by_centra_id(db: Session, centra_id: int):
    return db.query(models.Batch).filter(models.Batch.Centra_ID == centra_id).all()

def create_batch(db: Session, batch: BatchCreate):
    db_batch = models.Batch(
        RawWeight=batch.RawWeight,
        InTimeRaw=batch.InTimeRaw,
        Status=batch.Status,
        Centra_ID=batch.Centra_ID
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch
