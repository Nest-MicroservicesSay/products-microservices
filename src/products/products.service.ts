import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService')
  
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
    
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    })

  }

  async findAll(paginationDto : PaginationDto) {

    const  {limit,page} = paginationDto;
    
    const totalPages = await this.product.count({ where : {avaible: true}});

    const lastPage= Math.ceil(totalPages / limit);

    const data = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: {avaible:true}
      
    })


    return{
      data,
      meta:{
        total: totalPages,
        page,
        lastPage
      }

    }
  }

  async findOne(id: number) {

    
    const data = await this.product.findUnique({
      where: {
        id,
        avaible:true
      }
    })
    
    if(!data){
      throw new NotFoundException(`Product with id ${id} not found`);
    }


    return data;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id: __, ...data} = updateProductDto;

    await this.findOne(id);
    return this.product.update({
       where :{id},
       data: data
    })

  }

  async remove(id: number) {

    this.findOne(id)

    // return this.product.delete({
    //   where: {id}
    // });

    const product = await this.product.update({
      where:{id},
      data:{
        avaible: false
      }
    })

    return product;
  }

  handleException(error: any) {
    this.logger.error(error);
  }
}
