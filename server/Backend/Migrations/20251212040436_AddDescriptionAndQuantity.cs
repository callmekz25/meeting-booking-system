using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionAndQuantity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "2c3842b2-1848-443e-b1f1-469cac33e2a8");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "c9f5465f-8384-422e-928d-fa611531eed9");

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "RoomEquipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "Inventories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Bookings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "16a122e2-5883-4277-afa8-5b993aa7251e", null, "NormalUser", "NORMALUSER" },
                    { "9432f5cb-54f2-4ce3-8d37-85db136a0406", null, "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "16a122e2-5883-4277-afa8-5b993aa7251e");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "9432f5cb-54f2-4ce3-8d37-85db136a0406");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "RoomEquipments");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Bookings");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "2c3842b2-1848-443e-b1f1-469cac33e2a8", null, "NormalUser", "NORMALUSER" },
                    { "c9f5465f-8384-422e-928d-fa611531eed9", null, "Admin", "ADMIN" }
                });
        }
    }
}
