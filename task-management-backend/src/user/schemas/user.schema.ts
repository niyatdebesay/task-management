import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Role } from "../enum/role.enum";
import { ObjectId } from "mongoose";
@Schema()
export class User {

    _id: ObjectId;
    
    @Prop({
        required : true,
        minlength: 3,
        
    })
    username:string;

    @Prop({
        unique:true,
        required:true,
        
    })
    email:string;

    @Prop({
    })
    password:string;

    @Prop({
       
        enum: Role,
        type: String,
        default: Role.USER

    })
    role:Role

    @Prop({
        default:Date.now
    })
    createdAt:Date;

    @Prop({default:Date.now})
    updatedAt:Date;

    
}
export const UserSchema = SchemaFactory.createForClass(User);
