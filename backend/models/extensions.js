import mongoose from 'mongoose';

const extensionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true } // Loại dịch vụ
});

const ExtensionModal = mongoose.model('extensions', extensionSchema);

export default ExtensionModal;
