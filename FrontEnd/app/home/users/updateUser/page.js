import { Suspense } from 'react';
import UpdateUser from './updateUser'; // assuming it's in the same folder

export default function UpdateUserPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdateUser />
    </Suspense>
  );
}
