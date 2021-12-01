import React from 'react';
import ClipboardText from './ClipboardText';
import EditItemTitle from '@monostruct/containers/itemDetail/EditItemTitle';

export default function DetailComponentInnerHeader() {
  return (
    <div>
      <Paper
        style={{
          padding: 10,
          margin: 10,
          display: 'flex',
          position: 'relative',
          flexDirection: 'column'
        }}
      >
        <Box style={{ zIndex: 999 }}>
          <EditItemTitle
            {...{
              name,
              updateItemOnServer: handleSave
            }}
          />
        </Box>
        <Headding as={'h5'}>
          Item ID:{id} <ClipboardText item_id={id} />
        </Headding>
        <Headding
          as={'h4'}
          style={{
            position: isMobile ? 'relative' : 'absolute',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            alignItems: 'center',
            height: '100%'
          }}
        >
          {tabName}
        </Headding>
      </Paper>
    </div>
  );
}
