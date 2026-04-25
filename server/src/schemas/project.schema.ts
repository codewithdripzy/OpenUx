import { Schema } from "mongoose";

const projectSchema = new Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        prompt: {
            type: String,
            required: false,
        },
        model: {
            type: String,
            required: false,
        },
        owner: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "User",
        },
        nodes: {
            type: Array,
            default: [],
        },
        metadata: {
            type: Object,
            default: {},
        }
    },
    {
        timestamps: true,
    }
);

projectSchema.set("toJSON", {
    transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    },
});

export default projectSchema;
