const models = require("../models") 
module.exports = class CrudService {
    async findOne(Model, condition) {
        return await models[Model].findOne({
            where: condition
        });
    }

    async findAll(Model, condition, order) {
        let option = {
            where: condition,
        }
        if(order != null){
            option.order = order
        }
        return await models[Model].findAll(option);
    }

    async listAll(Model, order) {
        let option = {}
        if(order != null){
            option.order = order
        }
        return await models[Model].findAll(option);
    }
 
    async create(Model, data) {
        return await models[Model].create(data);
    }

    async update(Model, data, condition) {
        return await models[Model].update(data, {where: condition});
    }

    async delete(Model, condition) {
        return await models[Model].destroy({where: condition});
    }

    async exists(Model, condition){
        var user = await models[Model].findOne({where: condition });
        if(user){
            return true
        }else{
            return false
        }
    }

    async createOrUpdate(Model, data, condition){
        let exists = await this.exists(Model, condition)
        if(!exists){
            delete data.id
            return this.create(Model, data)
        }else{
            return this.update(Model,data, condition)
        }
    }
}