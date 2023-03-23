/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model;

import java.util.List;

/**
 *
 * @author LENOVO
 */
public class consultaestudiante {

    private List<Integer> cursomatriculado;

    public boolean matricularcurso(int codigo, estudiante Estudiante) {
        try {
            cursomatriculado = Estudiante.getCursosmatricula();
            for (int i = 0; i < cursomatriculado.size(); i++) {
                if (cursomatriculado.get(i) == codigo) {
                    return false;
                }
            }
            cursomatriculado.add(codigo);
            Estudiante.setCursosmatricula(cursomatriculado);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean editarmatriculacurso(int codigo, int codigoactual, estudiante Estudiante) {
        try {
            cursomatriculado = Estudiante.getCursosmatricula();
            for (int i = 0; i < cursomatriculado.size(); i++) {
                if (cursomatriculado.get(i) == codigo) {
                    cursomatriculado.set(i, codigoactual);
                    Estudiante.setCursosmatricula(cursomatriculado);
                    return true;
                }
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean eliminarmatriculacurso(int codigo, estudiante Estudiante) {
        try {
            cursomatriculado = Estudiante.getCursosmatricula();

            for (int i = 0; i < cursomatriculado.size(); i++) {
                if (cursomatriculado.get(i) == codigo) {
                    cursomatriculado.remove(i);
                    Estudiante.setCursosmatricula(cursomatriculado);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
        }
        return false;
    }
}
