import os
from datetime import datetime, timedelta

import akshare as ak
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse

app = FastAPI(title="Trade Calendar Service")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/trade-cal")
async def trade_cal(
    start_date: str = Query(..., description="Start date in YYYYMMDD format"),
    end_date: str = Query(..., description="End date in YYYYMMDD format"),
    exchange: str = Query(default="SSE", description="Exchange code"),
):
    start = datetime.strptime(start_date, "%Y%m%d").date()
    end = datetime.strptime(end_date, "%Y%m%d").date()

    df = ak.tool_trade_date_hist_sina()
    trade_dates = set()
    date_col = df.columns[0]
    for val in df[date_col]:
        if isinstance(val, str):
            trade_dates.add(datetime.strptime(val, "%Y-%m-%d").date())
        else:
            trade_dates.add(val.date() if hasattr(val, "date") else val)

    result = []
    current = start
    while current <= end:
        result.append(
            {
                "cal_date": current.strftime("%Y-%m-%d"),
                "is_open": 1 if current in trade_dates else 0,
            }
        )
        current += timedelta(days=1)

    return JSONResponse(content=result)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PYTHON_SERVICE_PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
