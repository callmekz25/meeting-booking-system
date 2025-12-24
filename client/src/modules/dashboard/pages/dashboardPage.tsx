import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  DoorOpen,
  Monitor,
  Users,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { useGetDashboardStatics } from '../hooks/dashboard.hooks';
import Loading from '@/components/ui/loading';
import PieLegend from '../components/pieLegend';

const DashboardPage = () => {
  const { data: response, isLoading, isError } = useGetDashboardStatics();

  const data = response?.data;
  const roomStatusData = [
    { name: 'Available', value: data?.availableRooms ?? 0, color: 'hsl(var(--success))' },
    { name: 'Unavailable', value: data?.unavailableRooms ?? 0, color: 'hsl(var(--warning))' },
  ];

  const equipmentStatusData = [
    { name: 'Available', value: data?.availableInventory ?? 0, color: 'hsl(var(--success))' },
    { name: 'Maintenance', value: data?.maintenanceInventory ?? 0, color: 'hsl(var(--warning))' },
    {
      name: 'OutOfService',
      value: data?.outOfServiceInventory ?? 0,
      color: 'hsl(0, 84%, 60%)',
    },
  ];

  const chartConfig = {
    bookings: { label: 'Bookings', color: 'hsl(var(--primary))' },
    hours: { label: 'Hours', color: 'hsl(var(--chart-2))' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Analytics and usage statistics</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rooms</p>
                    <p className="text-3xl font-bold text-foreground">{data?.totalRooms}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DoorOpen className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="status-available">
                    {data?.availableRooms} Available
                  </Badge>
                  <Badge variant="outline" className="status-in-use">
                    {data?.unavailableRooms} Unavailable
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Equipment</p>
                    <p className="text-3xl font-bold text-foreground">{data?.totalInventory}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                    <Monitor className="h-6 w-6 text-chart-2" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="status-available">
                    {data?.availableInventory} Available
                  </Badge>
                  <Badge variant="outline" className="status-maintenance">
                    {data?.maintenanceInventory} Maintenance
                  </Badge>
                  <Badge variant="outline" className="status-maintenance">
                    {data?.outOfServiceInventory} Out Of Service
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-3xl font-bold text-foreground">{bookings.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-chart-3" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>This week's bookings</span>
                </div>
              </CardContent>
            </Card> */}

            {/* <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-3xl font-bold text-foreground">
                      {new Set(bookings.map((b) => b.createdBy)).size}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-chart-4/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-chart-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span>Users with bookings</span>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-4">
            {/* Room Usage Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Room Usage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="">
                  <BarChart data={data?.roomsUsage}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DoorOpen className="h-5 w-5 text-primary" />
                    Equipment Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className=" aspect-square w-full">
                    <PieChart>
                      <Pie
                        data={equipmentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {equipmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <PieLegend items={equipmentStatusData} />
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DoorOpen className="h-5 w-5 text-primary" />
                    Room Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className=" aspect-square w-full ">
                    <PieChart>
                      <Pie
                        data={roomStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {roomStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <PieLegend items={roomStatusData} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Most/Least Used Rooms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Most Used Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.topUsageRooms.map((room, index) => (
                  <div key={room.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-foreground">{room.name}</span>
                      </div>
                      <Badge variant="secondary">{room.usage} bookings</Badge>
                    </div>
                    <Progress
                      value={(room.usage / (data?.topUsageRooms?.[0].usage || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-warning" />
                  Underutilized Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.underUsageRooms.map((room, index) => (
                  <div key={room.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="font-medium text-foreground">{room.name}</span>
                      </div>
                      <Badge variant="outline">{room.usage} bookings</Badge>
                    </div>
                    <Progress value={room.usage > 0 ? 20 : 5} className="h-2" />
                  </div>
                ))}
                {/* {roomUsage.filter((r) => r.bookings === 0).length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Consider promoting these rooms or checking availability
                  </p>
                )} */}
              </CardContent>
            </Card>
          </div>

          {/* Equipment Usage */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Equipment Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.equipmentUsage.map((eq) => (
                  <div
                    key={eq.inventoryID}
                    className="p-4 rounded-lg border border-border bg-secondary/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">
                        {eq.serialNumber}
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {eq.typeName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={eq.usage * 20} className="h-2 flex-1" />
                      <span className="text-sm text-muted-foreground">{eq.usage} uses</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
