import React from 'react';
import CreateTripForm from '../components/Trips/CreateTripForm';

const CreateTrip: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CreateTripForm />
    </div>
  );
};

export default CreateTrip;