import React from 'react';
import PropTypes from 'prop-types';

import Headding from 'components/atoms/Headding';
import Flex from 'components/atoms/Flex';
import Button from 'components/atoms/Button';
import Space from 'components/atoms/Space';
import get from 'lodash/get';

const UploadImage = ({
  label, handleUploadImage, productDetails, uploadedImage, hasPermissionToEdit = true
}) => (
    <div className="bdb-upload-image">
      <Headding bold title={label} />
      <Space size={10} />
      <Flex>
        <div className="bdb-upload-image--board">
          {get(productDetails, 'productImageInfo.url') ? (
            <img
              className="productcard__img--label"
              src={uploadedImage || get(productDetails, 'productImageInfo.url') || productDetails.productLabelImagePath}
              alt=" "
              style={{
                backgroundColor: 'rgb(233, 241, 248)',
                border: '2px dashed rgb(121, 173, 213)',
                height: '114px',
                width: '111px'
              }}
            />
          ) : (
              <img
                className="productcard__img--label"
                alt=""
                src={uploadedImage || ''}
                style={{
                  backgroundColor: 'rgb(233, 241, 248)',
                  border: '2px dashed rgb(121, 173, 213)',
                  height: '114px',
                  width: '111px'
                }}
              />
            )}

        </div>
        <div>
          <Button
            disabled={!hasPermissionToEdit}
            additionalClassName="upload-toggle-button" rounded logixBlue onClick={handleUploadImage}>
            Upload Image
        </Button>
          <p>JPG, GIF or PNG</p>
        </div>
      </Flex>
    </div>
  );

UploadImage.propTypes = {
  label: PropTypes.string
};

export default UploadImage;
