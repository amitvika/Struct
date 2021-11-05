import { LinearProgress, CircularProgress, Typography } from '@material-ui/core';
export default function LinearProgressBarTiming (props) {
    const {  
        value,
        currentProgressText,
        completionProgressText,
        centerActionText,
        progressBarRender
    } = props;
    let getTrimmedValue = 0;
    getTrimmedValue =  value?parseFloat(value.toFixed(3)):0;
    if(isNaN(getTrimmedValue)) {
        getTrimmedValue=0;
    }
    //console.log("currentProgressText",currentProgressText,"CompletionProgressText",completionProgressText);
    return (
        <div style={{ position: "relative" }}>
            <LinearProgress
                variant="determinate"
                value={getTrimmedValue}
                {...props}
                style={{height:"15px"}}
            />
            {(currentProgressText || progressBarRender) && (
                <Typography
                    style={{
                        position: "absolute",
                        color: "white",
                        top: 0,
                        left: "5%",
                        transform: "translateX(-50%)",
                    }}
                >
                    {progressBarRender ? "Rendering" : currentProgressText}
                </Typography>
            )}
            
            <Typography
                style={{
                    position: "absolute",
                    color: "white",
                    top: 0,
                    left: "45%",
                    transform: "translateX(-50%)",
                }}
            >
                {centerActionText?centerActionText:progressBarRender?"Parsing Edges":"Parsing File"}
            </Typography>
            
            {(completionProgressText) && (
                <Typography
                    style={{
                        position: "absolute",
                        color: "white",
                        top: 0,
                        left: "95%",
                        transform: "translateX(-50%)",
                    }}
                >
                    {completionProgressText}
                </Typography>
            )}  
            { progressBarRender && ( <CircularProgress/> ) }               
        </div>
    );
}