from enum import Enum
from sre_constants import SUCCESS
class ChildCreationStatus(Enum):

    INITIATED = "INITIATED"
    NOT_INITIATED = "NOT_INITIATED"
    COMPLETED = "COMPLETED"

    @classmethod
    def choices(cls):
        
        return tuple((i.name, i.value) for i in cls)

class TransactionStatus(Enum):

    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    ERROR = "ERROR"

    @classmethod
    def choices(cls):
        print(tuple((i.name, i.value) for i in cls))
        return tuple((i.name, i.value) for i in cls)