import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, ObjectId, Types } from "mongoose";
import { Project } from "src/project/schema/project.schema";
import { User } from "src/user/schemas/user.schema";
import { Priority } from "../enum/priority.enum";
import { Status } from "src/project/enum/status.enum";

@Schema({ timestamps: true })
export class Task extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
    project: Types.ObjectId;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    assignedTo: Types.ObjectId[];

    @Prop()
    deadline: Date;

    @Prop({ enum: Priority })
    priority: Priority;

    @Prop({ enum: Status })
    status: Status;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
