import Button from '@mui/material/Button';
import FileHistory from '@monostruct/common/containers/FileHistory';
import Grid from '@mui/material/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';

const ImageAnnotationExcelUI = () => {
  const handleOnFileChange = () => {};
  const fileType = 'zip';

  return (
    <>
      <Grid item xs={2}>
        <Headding bold title={`Image Annotation Excel UI`} />
      </Grid>
      <Grid item xs={10}>
        <Button variant="contained" component="label">
          Select File
          <input
            onChange={handleOnFileChange}
            type="file"
            hidden
            accept={fileType}
          />
        </Button>
        <FileHistory
          selectedFileName={''}
          // link_id={documentValue.id}
        />
      </Grid>
    </>
  );
};

export default ImageAnnotationExcelUI;
