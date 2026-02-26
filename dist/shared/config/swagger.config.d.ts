export declare const swaggerDefinition: {
    openapi: string;
    info: {
        title: string;
        description: string;
        version: string;
        contact: {
            name: string;
            email: string;
        };
        license: {
            name: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    tags: {
        name: string;
        description: string;
    }[];
    components: {
        securitySchemes: {
            BearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
                description: string;
            };
        };
        schemas: {
            RegisterRequest: {
                type: string;
                required: string[];
                properties: {
                    nom: {
                        type: string;
                        description: string;
                        example: string;
                    };
                    prenom: {
                        type: string;
                        description: string;
                        example: string;
                    };
                    adresse: {
                        type: string;
                        description: string;
                        example: string;
                    };
                    tel: {
                        type: string;
                        description: string;
                        example: string;
                    };
                    email: {
                        type: string;
                        format: string;
                        description: string;
                        example: string;
                    };
                    password: {
                        type: string;
                        format: string;
                        description: string;
                        example: string;
                    };
                    type: {
                        type: string;
                        enum: string[];
                        description: string;
                        example: string;
                    };
                    professionId: {
                        type: string;
                        format: string;
                        description: string;
                        example: string;
                    };
                };
            };
            LoginRequest: {
                type: string;
                required: string[];
                properties: {
                    email: {
                        type: string;
                        format: string;
                        description: string;
                        example: string;
                    };
                    password: {
                        type: string;
                        format: string;
                        description: string;
                        example: string;
                    };
                };
            };
            AuthResponse: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                        example: string;
                    };
                    data: {
                        type: string;
                        properties: {
                            user: {
                                type: string;
                                properties: {
                                    id: {
                                        type: string;
                                        format: string;
                                        example: string;
                                    };
                                    nom: {
                                        type: string;
                                        example: string;
                                    };
                                    prenom: {
                                        type: string;
                                        example: string;
                                    };
                                    adresse: {
                                        type: string;
                                        example: string;
                                    };
                                    tel: {
                                        type: string;
                                        example: string;
                                    };
                                    email: {
                                        type: string;
                                        example: string;
                                    };
                                    role: {
                                        type: string;
                                        enum: string[];
                                        example: string;
                                    };
                                    workerStatus: {
                                        type: string;
                                        nullable: boolean;
                                        example: null;
                                    };
                                    professionId: {
                                        type: string;
                                        nullable: boolean;
                                        example: null;
                                    };
                                    createdAt: {
                                        type: string;
                                        format: string;
                                        example: string;
                                    };
                                    updatedAt: {
                                        type: string;
                                        format: string;
                                        example: string;
                                    };
                                };
                            };
                            token: {
                                type: string;
                                description: string;
                                example: string;
                            };
                        };
                    };
                };
            };
            UserResponse: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    nom: {
                        type: string;
                        description: string;
                    };
                    prenom: {
                        type: string;
                        description: string;
                    };
                    adresse: {
                        type: string;
                        description: string;
                    };
                    tel: {
                        type: string;
                        description: string;
                    };
                    email: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    workerStatus: {
                        type: string;
                        enum: string[];
                        nullable: boolean;
                    };
                    professionId: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                    };
                };
            };
            CreateUserRequest: {
                type: string;
                required: string[];
                properties: {
                    nom: {
                        type: string;
                        example: string;
                    };
                    prenom: {
                        type: string;
                        example: string;
                    };
                    adresse: {
                        type: string;
                        example: string;
                    };
                    tel: {
                        type: string;
                        example: string;
                    };
                    email: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    password: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                };
            };
            UpdateUserRequest: {
                type: string;
                properties: {
                    nom: {
                        type: string;
                        example: string;
                    };
                    prenom: {
                        type: string;
                        example: string;
                    };
                    adresse: {
                        type: string;
                        example: string;
                    };
                    tel: {
                        type: string;
                        example: string;
                    };
                    email: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                };
            };
            UserListResponse: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                        example: string;
                    };
                    data: {
                        type: string;
                        properties: {
                            users: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            pagination: {
                                type: string;
                                properties: {
                                    page: {
                                        type: string;
                                        example: number;
                                    };
                                    limit: {
                                        type: string;
                                        example: number;
                                    };
                                    total: {
                                        type: string;
                                        example: number;
                                    };
                                    totalPages: {
                                        type: string;
                                        example: number;
                                    };
                                };
                            };
                        };
                    };
                };
            };
            Profession: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    name: {
                        type: string;
                        example: string;
                    };
                    description: {
                        type: string;
                        nullable: boolean;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                    };
                };
            };
            CreateProfessionRequest: {
                type: string;
                required: string[];
                properties: {
                    name: {
                        type: string;
                        description: string;
                        example: string;
                    };
                    description: {
                        type: string;
                        description: string;
                    };
                };
            };
            Service: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    title: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    minPrice: {
                        type: string;
                    };
                    maxPrice: {
                        type: string;
                    };
                    workerId: {
                        type: string;
                        format: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                    };
                };
            };
            CreateServiceRequest: {
                type: string;
                required: string[];
                properties: {
                    title: {
                        type: string;
                        example: string;
                    };
                    description: {
                        type: string;
                        example: string;
                    };
                    minPrice: {
                        type: string;
                        example: number;
                    };
                    maxPrice: {
                        type: string;
                        example: number;
                    };
                    workerId: {
                        type: string;
                        format: string;
                        example: string;
                    };
                };
            };
            UpdateServiceRequest: {
                type: string;
                properties: {
                    title: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    minPrice: {
                        type: string;
                    };
                    maxPrice: {
                        type: string;
                    };
                };
            };
            ErrorResponse: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                        description: string;
                    };
                    code: {
                        type: string;
                        description: string;
                    };
                };
            };
            ValidationErrorResponse: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                        example: string;
                    };
                    code: {
                        type: string;
                        example: string;
                    };
                    errors: {
                        type: string;
                        description: string;
                    };
                };
            };
            UnauthorizedError: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                        example: string;
                    };
                    code: {
                        type: string;
                        example: string;
                    };
                };
            };
            ForbiddenError: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                        example: string;
                    };
                    code: {
                        type: string;
                        example: string;
                    };
                };
            };
            NotFoundError: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                        example: string;
                    };
                    code: {
                        type: string;
                        example: string;
                    };
                };
            };
            ConflictError: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                        example: string;
                    };
                    code: {
                        type: string;
                        example: string;
                    };
                };
            };
        };
        responses: {
            BadRequest: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            Unauthorized: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            Forbidden: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            NotFound: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            Conflict: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
        };
    };
    security: {
        BearerAuth: never[];
    }[];
};
export declare const swaggerOptions: {
    definition: {
        openapi: string;
        info: {
            title: string;
            description: string;
            version: string;
            contact: {
                name: string;
                email: string;
            };
            license: {
                name: string;
            };
        };
        servers: {
            url: string;
            description: string;
        }[];
        tags: {
            name: string;
            description: string;
        }[];
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: string;
                    scheme: string;
                    bearerFormat: string;
                    description: string;
                };
            };
            schemas: {
                RegisterRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        nom: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        prenom: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        adresse: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        tel: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        email: {
                            type: string;
                            format: string;
                            description: string;
                            example: string;
                        };
                        password: {
                            type: string;
                            format: string;
                            description: string;
                            example: string;
                        };
                        type: {
                            type: string;
                            enum: string[];
                            description: string;
                            example: string;
                        };
                        professionId: {
                            type: string;
                            format: string;
                            description: string;
                            example: string;
                        };
                    };
                };
                LoginRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        email: {
                            type: string;
                            format: string;
                            description: string;
                            example: string;
                        };
                        password: {
                            type: string;
                            format: string;
                            description: string;
                            example: string;
                        };
                    };
                };
                AuthResponse: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            example: boolean;
                        };
                        message: {
                            type: string;
                            example: string;
                        };
                        data: {
                            type: string;
                            properties: {
                                user: {
                                    type: string;
                                    properties: {
                                        id: {
                                            type: string;
                                            format: string;
                                            example: string;
                                        };
                                        nom: {
                                            type: string;
                                            example: string;
                                        };
                                        prenom: {
                                            type: string;
                                            example: string;
                                        };
                                        adresse: {
                                            type: string;
                                            example: string;
                                        };
                                        tel: {
                                            type: string;
                                            example: string;
                                        };
                                        email: {
                                            type: string;
                                            example: string;
                                        };
                                        role: {
                                            type: string;
                                            enum: string[];
                                            example: string;
                                        };
                                        workerStatus: {
                                            type: string;
                                            nullable: boolean;
                                            example: null;
                                        };
                                        professionId: {
                                            type: string;
                                            nullable: boolean;
                                            example: null;
                                        };
                                        createdAt: {
                                            type: string;
                                            format: string;
                                            example: string;
                                        };
                                        updatedAt: {
                                            type: string;
                                            format: string;
                                            example: string;
                                        };
                                    };
                                };
                                token: {
                                    type: string;
                                    description: string;
                                    example: string;
                                };
                            };
                        };
                    };
                };
                UserResponse: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                            format: string;
                            description: string;
                        };
                        nom: {
                            type: string;
                            description: string;
                        };
                        prenom: {
                            type: string;
                            description: string;
                        };
                        adresse: {
                            type: string;
                            description: string;
                        };
                        tel: {
                            type: string;
                            description: string;
                        };
                        email: {
                            type: string;
                            format: string;
                            description: string;
                        };
                        role: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        workerStatus: {
                            type: string;
                            enum: string[];
                            nullable: boolean;
                        };
                        professionId: {
                            type: string;
                            format: string;
                            nullable: boolean;
                        };
                        createdAt: {
                            type: string;
                            format: string;
                        };
                        updatedAt: {
                            type: string;
                            format: string;
                        };
                    };
                };
                CreateUserRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        nom: {
                            type: string;
                            example: string;
                        };
                        prenom: {
                            type: string;
                            example: string;
                        };
                        adresse: {
                            type: string;
                            example: string;
                        };
                        tel: {
                            type: string;
                            example: string;
                        };
                        email: {
                            type: string;
                            format: string;
                            example: string;
                        };
                        password: {
                            type: string;
                            format: string;
                            example: string;
                        };
                        role: {
                            type: string;
                            enum: string[];
                            example: string;
                        };
                    };
                };
                UpdateUserRequest: {
                    type: string;
                    properties: {
                        nom: {
                            type: string;
                            example: string;
                        };
                        prenom: {
                            type: string;
                            example: string;
                        };
                        adresse: {
                            type: string;
                            example: string;
                        };
                        tel: {
                            type: string;
                            example: string;
                        };
                        email: {
                            type: string;
                            format: string;
                            example: string;
                        };
                        role: {
                            type: string;
                            enum: string[];
                            example: string;
                        };
                    };
                };
                UserListResponse: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            example: boolean;
                        };
                        message: {
                            type: string;
                            example: string;
                        };
                        data: {
                            type: string;
                            properties: {
                                users: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                pagination: {
                                    type: string;
                                    properties: {
                                        page: {
                                            type: string;
                                            example: number;
                                        };
                                        limit: {
                                            type: string;
                                            example: number;
                                        };
                                        total: {
                                            type: string;
                                            example: number;
                                        };
                                        totalPages: {
                                            type: string;
                                            example: number;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                Profession: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                            format: string;
                        };
                        name: {
                            type: string;
                            example: string;
                        };
                        description: {
                            type: string;
                            nullable: boolean;
                        };
                        createdAt: {
                            type: string;
                            format: string;
                        };
                        updatedAt: {
                            type: string;
                            format: string;
                        };
                    };
                };
                CreateProfessionRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        name: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        description: {
                            type: string;
                            description: string;
                        };
                    };
                };
                Service: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                            format: string;
                        };
                        title: {
                            type: string;
                        };
                        description: {
                            type: string;
                        };
                        minPrice: {
                            type: string;
                        };
                        maxPrice: {
                            type: string;
                        };
                        workerId: {
                            type: string;
                            format: string;
                        };
                        createdAt: {
                            type: string;
                            format: string;
                        };
                        updatedAt: {
                            type: string;
                            format: string;
                        };
                    };
                };
                CreateServiceRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        title: {
                            type: string;
                            example: string;
                        };
                        description: {
                            type: string;
                            example: string;
                        };
                        minPrice: {
                            type: string;
                            example: number;
                        };
                        maxPrice: {
                            type: string;
                            example: number;
                        };
                        workerId: {
                            type: string;
                            format: string;
                            example: string;
                        };
                    };
                };
                UpdateServiceRequest: {
                    type: string;
                    properties: {
                        title: {
                            type: string;
                        };
                        description: {
                            type: string;
                        };
                        minPrice: {
                            type: string;
                        };
                        maxPrice: {
                            type: string;
                        };
                    };
                };
                ErrorResponse: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            example: boolean;
                        };
                        message: {
                            type: string;
                            description: string;
                        };
                        code: {
                            type: string;
                            description: string;
                        };
                    };
                };
                ValidationErrorResponse: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            example: boolean;
                        };
                        message: {
                            type: string;
                            example: string;
                        };
                        code: {
                            type: string;
                            example: string;
                        };
                        errors: {
                            type: string;
                            description: string;
                        };
                    };
                };
                UnauthorizedError: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            example: boolean;
                        };
                        message: {
                            type: string;
                            example: string;
                        };
                        code: {
                            type: string;
                            example: string;
                        };
                    };
                };
                ForbiddenError: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            example: boolean;
                        };
                        message: {
                            type: string;
                            example: string;
                        };
                        code: {
                            type: string;
                            example: string;
                        };
                    };
                };
                NotFoundError: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            example: boolean;
                        };
                        message: {
                            type: string;
                            example: string;
                        };
                        code: {
                            type: string;
                            example: string;
                        };
                    };
                };
                ConflictError: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            example: boolean;
                        };
                        message: {
                            type: string;
                            example: string;
                        };
                        code: {
                            type: string;
                            example: string;
                        };
                    };
                };
            };
            responses: {
                BadRequest: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                Unauthorized: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                Forbidden: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                NotFound: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                Conflict: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
        security: {
            BearerAuth: never[];
        }[];
    };
    apis: string[];
};
//# sourceMappingURL=swagger.config.d.ts.map