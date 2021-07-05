import os.path

from OCC.Core.XSControl import XSControl_WorkSession
from OCC.Core.STEPCAFControl import STEPCAFControl_Writer
from OCC.Core.STEPControl import STEPControl_AsIs #STEPControl_StepModelType,STEPControl_AsIs
from OCC.Core.IFSelect import  IFSelect_RetDone
from OCC.Core.XCAFApp import XCAFApp_Application_GetApplication
from OCC.Core.XmlDrivers import (
    XmlDrivers_DocumentStorageDriver,
    XmlDrivers_DocumentRetrievalDriver,
)
from OCC.Core.TCollection import TCollection_ExtendedString, TCollection_AsciiString
from OCC.Core.PCDM import PCDM_StoreStatus

from ..OCPAssembly import AssemblyProtocol, toCAF


def exportAssembly(assy: AssemblyProtocol, path: str) -> bool:

    _, doc = toCAF(assy, True)

    session = XSControl_WorkSession()
    writer = STEPCAFControl_Writer(session, False)
    writer.SetColorMode(True)
    writer.SetLayerMode(True)
    writer.SetNameMode(True)
    writer.Transfer(doc, STEPControl_AsIs)

    status = writer.Write(path)

    return status == IFSelect_RetDone


def exportCAF(assy: AssemblyProtocol, path: str) -> bool:

    folder, fname = os.path.split(path)
    name, ext = os.path.splitext(fname)
    ext = ext[1:] if ext[0] == "." else ext

    _, doc = toCAF(assy)
    app = XCAFApp_Application_GetApplication()

    store = XmlDrivers_DocumentStorageDriver(
        TCollection_ExtendedString("Copyright: Open Cascade, 2001-2002")
    )
    ret = XmlDrivers_DocumentRetrievalDriver()

    app.DefineFormat(
        TCollection_AsciiString("XmlOcaf"),
        TCollection_AsciiString("Xml XCAF Document"),
        TCollection_AsciiString(ext),
        ret,
        store,
    )

    doc.SetRequestedFolder(TCollection_ExtendedString(folder))
    doc.SetRequestedName(TCollection_ExtendedString(name))

    status = app.SaveAs(doc, TCollection_ExtendedString(path))

    app.Close(doc)

    return status == PCDM_StoreStatus.PCDM_SS_OK
