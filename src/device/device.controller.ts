import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceEntity } from './device.entity';
import { CreateDeviceDto, DeviceDto } from "./dto/deviceDto";

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('create')
  async create(@Body() createDto: CreateDeviceDto): Promise<DeviceEntity> {
    return this.deviceService.create(createDto);
  }

  @Get('get')
  async get(): Promise<DeviceEntity[]> {
    return await this.deviceService.find();
  }

  @Put('put')
  async put(@Body() createDto: DeviceDto): Promise<void> {
    return this.deviceService.update(createDto);
  }
}
