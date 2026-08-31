from fastapi import APIRouter, Request, Response
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

AUTODISCOVER_XML_TEMPLATE = """<?xml version="1.0" encoding="utf-8"?>
<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006">
  <Response xmlns="http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a">
    <Account>
      <AccountType>email</AccountType>
      <Action>settings</Action>
      <Protocol>
        <Type>IMAP</Type>
        <Server>mail.yourdomain.com</Server>
        <Port>993</Port>
        <SSL>on</SSL>
        <AuthRequired>on</AuthRequired>
      </Protocol>
      <Protocol>
        <Type>SMTP</Type>
        <Server>mail.yourdomain.com</Server>
        <Port>587</Port>
        <SSL>on</SSL>
        <Encryption>TLS</Encryption>
        <AuthRequired>on</AuthRequired>
      </Protocol>
    </Account>
  </Response>
</Autodiscover>
"""

@router.post("/autodiscover.xml")
@router.get("/autodiscover.xml")
@router.post("/Autodiscover.xml")
@router.get("/Autodiscover.xml")
async def handle_autodiscover(request: Request):
    """
    Microsoft Exchange compatible Autodiscover endpoint.
    Allows Outlook desktop, iOS Mail, and Android to automatically configure accounts.
    """
    return Response(content=AUTODISCOVER_XML_TEMPLATE, media_type="application/xml")
