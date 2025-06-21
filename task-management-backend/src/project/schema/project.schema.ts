import { Schema , Prop, SchemaFactory} from "@nestjs/mongoose";
import mongoose, { ObjectId, Types } from "mongoose";
import { Status } from "../enum/status.enum";
import { Task } from "src/task/schema/task.schema";
import { User } from "src/user/schemas/user.schema";
import { Priority } from "src/task/enum/priority.enum";
@Schema()
export class Project {
    _id:ObjectId;
    @Prop()
    name:string;

    @Prop()
    description:string;

    @Prop()
    deadline:Date

    @Prop({
        type:String, 
        enum:Priority
    })
    priority:Priority

    @Prop({
        default:Date.now
    })
    createdAt:Date;

    @Prop(
        {
            default:Date.now
        }
    )
    updatedAt:Date

    @Prop({
            ref:"User" , 
            type:mongoose.Schema.Types.ObjectId
            , required: true
        
        
        
    })
    creator:mongoose.Schema.Types.ObjectId;

    @Prop({
        type:[{ref:'Task', type:mongoose.Schema.Types.ObjectId}]
    })
    task:mongoose.Types.ObjectId[];

    @Prop({
        type:[{ref:'User', type:mongoose.Schema.Types.ObjectId}],
        
    })
    teamMembers:Types.ObjectId[];
    

}
export const ProjectSchema = SchemaFactory.createForClass(Project)
