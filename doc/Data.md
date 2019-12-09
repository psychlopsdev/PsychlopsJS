class Psychlops::Color
==========================


Functions
-----------

### Class Functions

`Data::savearray(filename, header, number_of_array, array, ...)`

`Data::loadCSVasFloat(filename)`
: set gamma value by default value. The default value could be changed by auxiliary tool.

```C++
auto table = Data::loadCSVasFloat("table.csv");
for(int row=0; row<max_row; row++)
{
    for(int col=0; col<max_col; col++)
    {
        table[row][col];
    }
}
```