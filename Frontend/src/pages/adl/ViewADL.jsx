import React from 'react';
import EditADL from './EditADL';

const ViewADL = () => {
  // Simply render EditADL in read-only mode without any buttons
  return <EditADL readOnly={true} />;
};

export default ViewADL;
