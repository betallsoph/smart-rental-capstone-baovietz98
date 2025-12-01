export enum ServiceType {
    INDEX = 'INDEX',
    FIXED = 'FIXED',
}

export enum CalculationType {
    PER_ROOM = 'PER_ROOM',
    PER_PERSON = 'PER_PERSON',
}

export interface Service {
    id: number;
    name: string;
    price: number;
    unit: string;
    type: ServiceType;
    calculationType?: CalculationType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceDto {
    name: string;
    price: number;
    unit: string;
    type: ServiceType;
    calculationType?: CalculationType;
    isActive?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> { }
