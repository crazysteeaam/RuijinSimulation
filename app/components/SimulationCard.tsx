import { Card, Typography } from 'antd';
import Image from 'next/image';
import Link from 'next/link';

const { Title, Text } = Typography;

interface SimulationCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
}

export default function SimulationCard({ title, description, image, href }: SimulationCardProps) {
  return (
    <Link href={href} className="block">
      <Card 
        hoverable 
        className="w-full transition-transform hover:scale-[1.02]"
        cover={
          <div className="relative h-48">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        }
      >
        <Title level={4}>{title}</Title>
        <Text type="secondary">{description}</Text>
      </Card>
    </Link>
  );
} 