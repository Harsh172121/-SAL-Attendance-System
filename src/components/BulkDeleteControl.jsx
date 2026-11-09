import { useState } from 'react';
import { toast } from 'react-toastify';
import Button from './Button';
import Modal from './Modal';

const deleteItems = async (ids, deleteItem) => {
  const results = new Array(ids.length);
  let nextIndex = 0;
  const workerCount = Math.min(ids.length, 5);

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < ids.length) {
      const index = nextIndex;
      nextIndex += 1;

      try {
        results[index] = { status: 'fulfilled', value: await deleteItem(ids[index]) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }));

  return results;
};

const BulkDeleteControl = ({
  selectedIds,
  onSelectionChange,
  deleteItem,
  deleteMany,
  onDeleted,
  itemLabel,
  itemLabelPlural,
  consequences
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const closeDialog = () => {
    if (!isDeleting) setIsOpen(false);
  };

  const handleDelete = async () => {
    if (isDeleting || selectedIds.length === 0) return;

    setIsDeleting(true);
    let results;
    try {
      if (deleteMany) {
        const deletedIds = await deleteMany(selectedIds);
        const deletedIdSet = new Set(deletedIds);
        results = selectedIds.map((id) => ({
          status: 'fulfilled',
          value: deletedIdSet.has(id)
        }));
      } else {
        results = await deleteItems(selectedIds, deleteItem);
      }
    } catch (reason) {
      results = selectedIds.map(() => ({ status: 'rejected', reason }));
    }
    const deletedIds = [];
    const failures = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        deletedIds.push(selectedIds[index]);
      } else {
        failures.push(result.status === 'rejected' ? result.reason : null);
      }
    });

    if (deletedIds.length > 0) {
      toast.success(`Deleted ${deletedIds.length} ${deletedIds.length === 1 ? itemLabel : itemLabelPlural}.`);
      try {
        await onDeleted();
      } catch {
        toast.error('Records were deleted, but the list could not be refreshed.');
      }
    }

    if (failures.length > 0) {
      const reason = failures.find(Boolean);
      const message = reason?.response?.data?.message;
      toast.error(
        `${failures.length} ${failures.length === 1 ? itemLabel : itemLabelPlural} could not be deleted${message ? `: ${message}` : '.'}`
      );
    }

    setIsDeleting(false);
    setIsOpen(false);
    onSelectionChange(selectedIds.filter((id) => !deletedIds.includes(id)));
  };

  return (
    <>
      {selectedIds.length > 0 && (
        <Button variant="danger" size="sm" onClick={() => setIsOpen(true)}>
          Delete selected ({selectedIds.length})
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={closeDialog}
        title={`Delete ${selectedIds.length} ${selectedIds.length === 1 ? itemLabel : itemLabelPlural}?`}
        size="sm"
      >
        <p className="mb-6 text-center text-gray-600">
          This will permanently delete the selected {selectedIds.length === 1 ? itemLabel : itemLabelPlural}. Continue?
        </p>
        {consequences && (
          <p className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {consequences}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={closeDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : `Delete ${selectedIds.length}`}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default BulkDeleteControl;
