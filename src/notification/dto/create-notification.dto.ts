export class CreateNotificationDto {
  type!: string;
  title!: string;
  message!: string;
  data?: any;
}
