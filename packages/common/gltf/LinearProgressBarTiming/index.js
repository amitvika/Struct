import { LinearProgress, Typography } from '@material-ui/core';
export default function LinearProgressBarTiming (props) {
    const {  
        value,
        currentProgressText,
        completionProgressText,
    } = props;
    //console.log("currentProgressText",currentProgressText,"CompletionProgressText",completionProgressText);
    return (
        <div style={{ position: "relative" }}>
            <LinearProgress
                variant="determinate"
                value={value?value:value.toFixed(3)}
                {...props}
                style={{height:"15px"}}
            />
            {currentProgressText && (
                <Typography
                    style={{
                        position: "absolute",
                        color: "white",
                        top: 0,
                        left: "5%",
                        transform: "translateX(-50%)",
                    }}
                >
                    {currentProgressText}
                </Typography>
            )}
            {completionProgressText && (
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
        </div>
    );
}