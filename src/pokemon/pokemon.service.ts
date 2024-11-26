import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Pokemon already exists');
      }
      console.error(error);
      throw new InternalServerErrorException('An error occurred');
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    try {
      let pokemon = null;
      if (!isNaN(+id)) {
        pokemon = await this.pokemonModel.findOne({ no: id });
      }

      // Verificar por mongoId
      if (!pokemon && isValidObjectId(id)) {
        pokemon = await this.pokemonModel.findById(id);
      }

      // Verificar por name
      if (!pokemon) {
        pokemon = await this.pokemonModel.findOne({ name: id.toLowerCase() });
      }

      if (!pokemon) throw new BadRequestException('Pokemon not found');

      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

      try {
        const pokemon = await this.findOne(id);
        await pokemon.updateOne(updatePokemonDto, { new: true });
      } catch (error) {
        throw new BadRequestException('Pokemon already exists', error);
      }
    }

    return updatePokemonDto;
  }

  async remove(id: string) {
    try {
      return await this.pokemonModel.findOne({ no: id }).deleteOne();
    } catch (error) {
      throw new BadRequestException('Pokemon not found', error);
    }
  }

  private handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException('Pokemon already exists');
    }
    console.error(error);
    throw new InternalServerErrorException('An error occurred');
  }
}
