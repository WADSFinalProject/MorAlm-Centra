from fastapi import FastAPI, HTTPException, Depends, Request
from sqlalchemy.orm import Session
import models
from schemas import CentraCreate, Centra, DeliveryCreate, Delivery, BatchCreate, Batch, DeliveryUpdate
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import pytz
import crud
from models import SessionLocal
import logging
from fastapi.responses import JSONResponse

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the specific origins you want to allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BatchUpdate(BaseModel):
    step: str
    weight: int
    in_time: Optional[datetime] = None

class BatchCreateRequest(BaseModel):
    weight: int
    centra_id: int

class DeliverRequest(BaseModel):
    batchIds: List[int]
    expeditionType: str

@app.exception_handler(Exception)
async def validation_exception_handler(request: Request, exc: Exception):
    logger.error(f"Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": f"Internal Server Error: {exc}"},
    )

@app.get("/api/weights")
def get_weights(centra_id: int, db: Session = Depends(get_db)):
    weights = crud.get_weights_by_centra_id(db, centra_id=centra_id)
    return weights

@app.get("/api/batches")
def get_batches(centra_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Batch)
    if centra_id is not None:
        query = query.filter(models.Batch.Centra_ID == centra_id)
    if status is not None:
        query = query.filter(models.Batch.Status == status)
    batches = query.all()
    return batches

@app.post("/centra/", response_model=Centra)
def create_centra(centra: CentraCreate, db: Session = Depends(get_db)):
    db_centra = models.Centra(**centra.dict())
    db.add(db_centra)
    db.commit()
    db.refresh(db_centra)
    return db_centra

@app.get("/centra/", response_model=List[Centra])
def read_centras(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Centra).offset(skip).limit(limit).all()

@app.get("/centra/{centra_id}", response_model=Centra)
def read_centra(centra_id: int, db: Session = Depends(get_db)):
    db_centra = db.query(models.Centra).filter(models.Centra.Centra_ID == centra_id).first()
    if db_centra is None:
        raise HTTPException(status_code=404, detail="Centra not found")
    return db_centra

@app.put("/centra/{centra_id}", response_model=Centra)
def update_centra(centra_id: int, centra: CentraCreate, db: Session = Depends(get_db)):
    db_centra = db.query(models.Centra).filter(models.Centra.Centra_ID == centra_id).first()
    if db_centra is None:
        raise HTTPException(status_code=404, detail="Centra not found")
    for key, value in centra.dict().items():
        setattr(db_centra, key, value)
    db.commit()
    db.refresh(db_centra)
    return db_centra

@app.delete("/centra/{centra_id}", response_model=Centra)
def delete_centra(centra_id: int, db: Session = Depends(get_db)):
    db_centra = db.query(models.Centra).filter(models.Centra.Centra_ID == centra_id).first()
    if db_centra is None:
        raise HTTPException(status_code=404, detail="Centra not found")
    db.delete(db_centra)
    db.commit()
    return db_centra

@app.post("/delivery/", response_model=Delivery)
def create_delivery(delivery: DeliveryCreate, db: Session = Depends(get_db)):
    db_delivery = models.Delivery(**delivery.dict())
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@app.get("/delivery/", response_model=List[Delivery])
def read_deliveries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Delivery).offset(skip).limit(limit).all()

@app.get("/delivery/{package_id}", response_model=Delivery)
def read_delivery(package_id: int, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.Package_ID == package_id).first()
    if db_delivery is None:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return db_delivery

@app.put("/delivery/{package_id}", response_model=Delivery)
def update_delivery(package_id: int, delivery: DeliveryUpdate, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.Package_ID == package_id).first()
    if db_delivery is None:
        raise HTTPException(status_code=404, detail="Delivery not found")
    for key, value in delivery.dict(exclude_unset=True).items():
        setattr(db_delivery, key, value)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@app.delete("/delivery/{package_id}", response_model=Delivery)
def delete_delivery(package_id: int, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.Package_ID == package_id).first()
    if db_delivery is None:
        raise HTTPException(status_code=404, detail="Delivery not found")
    db.delete(db_delivery)
    db.commit()
    return db_delivery

@app.post("/batch/", response_model=Batch)
def create_batch(batch: BatchCreate, db: Session = Depends(get_db)):
    db_batch = models.Batch(**batch.dict())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

@app.get("/batch/", response_model=List[Batch])
def read_batches(skip: int = 0, limit: int = 100, centra_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Batch)
    if centra_id is not None:
        query = query.filter(models.Batch.Centra_ID == centra_id)
    if status is not None:
        query = query.filter(models.Batch.Status == status)
    query = query.offset(skip).limit(limit)
    return query.all()

@app.get("/batch/{batch_id}", response_model=Batch)
def read_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.Batch_ID == batch_id).first()
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch

@app.get("/batch/package/{package_id}", response_model=Batch)
def read_batch_by_package(package_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.Package_ID == package_id).first()
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch

@app.get("/centra/batch/{batch_id}", response_model=Centra)
def read_centra_by_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.Batch_ID == batch_id).first()
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    db_centra = db.query(models.Centra).filter(models.Centra.Centra_ID == db_batch.Centra_ID).first()
    if db_centra is None:
        raise HTTPException(status_code=404, detail="Centra not found")
    return db_centra

@app.put("/batch/{batch_id}", response_model=Batch)
def update_batch(batch_id: int, batch_update: BatchUpdate, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.Batch_ID == batch_id).first()
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    gmt7 = pytz.timezone('Asia/Jakarta')
    
    if batch_update.in_time:
        in_time_gmt7 = batch_update.in_time.astimezone(gmt7)
        if batch_update.step == 'Wet Leaves':
            db_batch.InTimeWet = in_time_gmt7
        elif batch_update.step == 'Dry Leaves':
            db_batch.InTimeDry = in_time_gmt7
        elif batch_update.step == 'Flour Leaves':
            db_batch.InTimePowder = in_time_gmt7

    now_gmt7 = datetime.now(pytz.utc).astimezone(gmt7)

    if batch_update.step == 'Wet Leaves':
        db_batch.WetWeight = batch_update.weight
        db_batch.OutTimeWet = now_gmt7
        db_batch.Status = 'Wet Leaves'
    elif batch_update.step == 'Dry Leaves':
        db_batch.DryWeight = batch_update.weight
        db_batch.OutTimeDry = now_gmt7
        db_batch.Status = 'Dry Leaves'
    elif batch_update.step == 'Flour Leaves':
        db_batch.PowderWeight = batch_update.weight
        db_batch.OutTimePowder = now_gmt7
        db_batch.Status = 'Flour Leaves'

    db.commit()
    db.refresh(db_batch)
    return db_batch

@app.delete("/batch/{batch_id}", response_model=Batch)
def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.Batch_ID == batch_id).first()
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    db.delete(db_batch)
    db.commit()
    return db_batch

@app.post("/api/create_batch", response_model=Batch)
def create_new_batch(request: BatchCreateRequest, db: Session = Depends(get_db)):
    try:
        gmt7 = pytz.timezone('Asia/Jakarta')
        new_batch = models.Batch(
            RawWeight=request.weight,
            InTimeRaw=datetime.now(pytz.utc).astimezone(gmt7),
            Centra_ID=request.centra_id,
            Status='Gather Leaves'
        )
        db.add(new_batch)
        db.commit()
        db.refresh(new_batch)
        return new_batch
    except Exception as e:
        logger.error(f"Error creating new batch: {e}")
        raise HTTPException(status_code=500, detail="Error creating new batch")

@app.post("/api/deliver")
def deliver_batches(deliver_request: DeliverRequest, db: Session = Depends(get_db)):
    try:
        gmt7 = pytz.timezone('Asia/Jakarta')
        now_gmt7 = datetime.now(pytz.utc).astimezone(gmt7)
        new_package = models.Delivery(
            Status='Pending',
            InDeliveryTime=now_gmt7,
            OutDeliveryTime=None,
            ExpeditionType=deliver_request.expeditionType
        )
        db.add(new_package)
        db.commit()
        db.refresh(new_package)

        for batch_id in deliver_request.batchIds:
            db_batch = db.query(models.Batch).filter(models.Batch.Batch_ID == batch_id).first()
            if db_batch:
                db_batch.Package_ID = new_package.Package_ID
                db_batch.Status = 'Pending'
                db_batch.ExpeditionType = deliver_request.expeditionType
                db.commit()
        
        return {"message": "Batches delivered successfully", "package_id": new_package.Package_ID}
    except Exception as e:
        logger.error(f"Error delivering batches: {e}")
        raise HTTPException(status_code=500, detail="Error delivering batches")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
